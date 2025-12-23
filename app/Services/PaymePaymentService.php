<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymePaymentService
{
    private $merchantId;
    private $secretKey;
    private $apiUrl;

    public function __construct()
    {
        $this->merchantId = config('payment.payme.merchant_id');
        $this->secretKey = config('payment.payme.secret_key');
        $this->apiUrl = config('payment.payme.api_url', 'https://checkout.paycom.uz/api');
    }

    /**
     * Generate payment URL for Payme
     */
    public function generatePaymentUrl($bookingId, $amount, $returnUrl = null)
    {
        $booking = Booking::findOrFail($bookingId);
        
        // Payme requires amount in tiyin (1 UZS = 100 tiyin)
        $amountInTiyin = $amount * 100;

        $params = [
            'm' => $this->merchantId,
            'ac.booking_id' => $bookingId,
            'a' => $amountInTiyin,
            'c' => $returnUrl ?? config('app.url') . '/payment/callback/payme',
        ];

        // Encode params to base64
        $encodedParams = base64_encode(json_encode($params));

        $url = 'https://checkout.paycom.uz/' . $encodedParams;

        return $url;
    }

    /**
     * Handle Payme webhook request
     */
    public function handleWebhook($request)
    {
        Log::info('Payme Webhook Request', $request->all());

        try {
            // Verify authorization
            if (!$this->verifyAuthorization($request)) {
                return $this->errorResponse(-32504, 'Insufficient privileges');
            }

            $method = $request->input('method');
            $params = $request->input('params');

            switch ($method) {
                case 'CheckPerformTransaction':
                    return $this->checkPerformTransaction($params);
                
                case 'CreateTransaction':
                    return $this->createTransaction($params);
                
                case 'PerformTransaction':
                    return $this->performTransaction($params);
                
                case 'CancelTransaction':
                    return $this->cancelTransaction($params);
                
                case 'CheckTransaction':
                    return $this->checkTransaction($params);
                
                default:
                    return $this->errorResponse(-32601, 'Method not found');
            }

        } catch (\Exception $e) {
            Log::error('Payme Webhook Error: ' . $e->getMessage());
            return $this->errorResponse(-32400, 'System error');
        }
    }

    /**
     * Check if transaction can be performed
     */
    private function checkPerformTransaction($params)
    {
        $bookingId = $params['account']['booking_id'] ?? null;
        $amount = $params['amount'] ?? 0;

        if (!$bookingId) {
            return $this->errorResponse(-31050, 'Booking not found');
        }

        $booking = Booking::find($bookingId);

        if (!$booking) {
            return $this->errorResponse(-31050, 'Booking not found');
        }

        // Check amount (Payme sends in tiyin)
        if ($booking->total_amount * 100 != $amount) {
            return $this->errorResponse(-31001, 'Incorrect amount');
        }

        // Check if already paid
        $existingPayment = Payment::where('booking_id', $booking->id)
            ->where('status', 'completed')
            ->first();

        if ($existingPayment) {
            return $this->errorResponse(-31099, 'Already paid');
        }

        return [
            'result' => [
                'allow' => true,
            ]
        ];
    }

    /**
     * Create transaction
     */
    private function createTransaction($params)
    {
        $transactionId = $params['id'] ?? null;
        $bookingId = $params['account']['booking_id'] ?? null;
        $amount = $params['amount'] ?? 0;

        $booking = Booking::find($bookingId);

        if (!$booking) {
            return $this->errorResponse(-31050, 'Booking not found');
        }

        // Check if transaction already exists
        $existingPayment = Payment::where('transaction_id', $transactionId)->first();

        if ($existingPayment) {
            return [
                'result' => [
                    'create_time' => strtotime($existingPayment->created_at) * 1000,
                    'transaction' => (string)$existingPayment->id,
                    'state' => $existingPayment->status === 'completed' ? 2 : 1,
                ]
            ];
        }

        // Create payment with pending status
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'amount' => $amount / 100, // Convert from tiyin
            'payment_method' => 'online',
            'transaction_id' => $transactionId,
            'status' => 'pending',
            'notes' => 'Payme payment',
        ]);

        return [
            'result' => [
                'create_time' => time() * 1000,
                'transaction' => (string)$payment->id,
                'state' => 1,
            ]
        ];
    }

    /**
     * Perform (complete) transaction
     */
    private function performTransaction($params)
    {
        $transactionId = $params['id'] ?? null;

        $payment = Payment::where('transaction_id', $transactionId)->first();

        if (!$payment) {
            return $this->errorResponse(-31003, 'Transaction not found');
        }

        if ($payment->status === 'completed') {
            return [
                'result' => [
                    'transaction' => (string)$payment->id,
                    'perform_time' => strtotime($payment->paid_at) * 1000,
                    'state' => 2,
                ]
            ];
        }

        // Complete payment
        $payment->update([
            'status' => 'completed',
            'paid_at' => now(),
        ]);

        // Update booking status
        $booking = $payment->booking;
        if ($booking->status === 'pending') {
            $booking->update(['status' => 'confirmed']);
        }

        return [
            'result' => [
                'transaction' => (string)$payment->id,
                'perform_time' => time() * 1000,
                'state' => 2,
            ]
        ];
    }

    /**
     * Cancel transaction
     */
    private function cancelTransaction($params)
    {
        $transactionId = $params['id'] ?? null;

        $payment = Payment::where('transaction_id', $transactionId)->first();

        if (!$payment) {
            return $this->errorResponse(-31003, 'Transaction not found');
        }

        $payment->update([
            'status' => 'failed',
        ]);

        return [
            'result' => [
                'transaction' => (string)$payment->id,
                'cancel_time' => time() * 1000,
                'state' => -1,
            ]
        ];
    }

    /**
     * Check transaction status
     */
    private function checkTransaction($params)
    {
        $transactionId = $params['id'] ?? null;

        $payment = Payment::where('transaction_id', $transactionId)->first();

        if (!$payment) {
            return $this->errorResponse(-31003, 'Transaction not found');
        }

        $state = match($payment->status) {
            'pending' => 1,
            'completed' => 2,
            'failed' => -1,
            default => 0,
        };

        return [
            'result' => [
                'create_time' => strtotime($payment->created_at) * 1000,
                'perform_time' => $payment->paid_at ? strtotime($payment->paid_at) * 1000 : 0,
                'cancel_time' => 0,
                'transaction' => (string)$payment->id,
                'state' => $state,
                'reason' => null,
            ]
        ];
    }

    /**
     * Verify Payme authorization header
     */
    private function verifyAuthorization($request)
    {
        $authHeader = $request->header('Authorization');
        
        if (!$authHeader || !str_starts_with($authHeader, 'Basic ')) {
            return false;
        }

        $credentials = base64_decode(substr($authHeader, 6));
        list($username, $password) = explode(':', $credentials);

        return $username === 'Paycom' && $password === $this->secretKey;
    }

    /**
     * Error response format for Payme
     */
    private function errorResponse($code, $message)
    {
        return [
            'error' => [
                'code' => $code,
                'message' => $message,
            ]
        ];
    }
}
