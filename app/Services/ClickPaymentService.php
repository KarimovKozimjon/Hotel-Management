<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ClickPaymentService
{
    private $merchantId;
    private $serviceId;
    private $secretKey;
    private $apiUrl;

    public function __construct()
    {
        $this->merchantId = config('payment.click.merchant_id');
        $this->serviceId = config('payment.click.service_id');
        $this->secretKey = config('payment.click.secret_key');
        $this->apiUrl = config('payment.click.api_url', 'https://api.click.uz/v2/merchant');
    }

    /**
     * Generate payment URL for Click
     */
    public function generatePaymentUrl($bookingId, $amount, $returnUrl = null)
    {
        $booking = Booking::findOrFail($bookingId);
        
        $params = [
            'service_id' => $this->serviceId,
            'merchant_id' => $this->merchantId,
            'amount' => $amount,
            'transaction_param' => $bookingId,
            'return_url' => $returnUrl ?? config('app.url') . '/payment/callback/click',
            'merchant_trans_id' => 'BK-' . $bookingId . '-' . time(),
        ];

        $url = 'https://my.click.uz/services/pay?' . http_build_query($params);

        return $url;
    }

    /**
     * Prepare transaction (Click calls this first)
     */
    public function prepare($data)
    {
        Log::info('Click Prepare Request', $data);

        try {
            // Verify signature
            if (!$this->verifySignature($data)) {
                return $this->errorResponse(-1, 'Invalid signature');
            }

            $bookingId = $data['merchant_trans_id'] ?? null;
            $amount = $data['amount'] ?? 0;

            if (!$bookingId) {
                return $this->errorResponse(-5, 'Booking not found');
            }

            // Extract booking ID from merchant_trans_id (format: BK-{id}-{timestamp})
            preg_match('/BK-(\d+)-/', $bookingId, $matches);
            $actualBookingId = $matches[1] ?? null;

            if (!$actualBookingId) {
                return $this->errorResponse(-5, 'Invalid booking ID');
            }

            $booking = Booking::find($actualBookingId);

            if (!$booking) {
                return $this->errorResponse(-5, 'Booking not found');
            }

            // Check if amount matches
            if ($booking->total_amount != $amount / 100) { // Click sends amount in tiyin
                return $this->errorResponse(-2, 'Incorrect amount');
            }

            // Check if already paid
            $existingPayment = Payment::where('booking_id', $booking->id)
                ->where('status', 'completed')
                ->first();

            if ($existingPayment) {
                return $this->errorResponse(-4, 'Already paid');
            }

            return [
                'error' => 0,
                'error_note' => 'Success',
                'click_trans_id' => $data['click_trans_id'],
                'merchant_trans_id' => $data['merchant_trans_id'],
                'merchant_prepare_id' => time(),
            ];

        } catch (\Exception $e) {
            Log::error('Click Prepare Error: ' . $e->getMessage());
            return $this->errorResponse(-8, 'System error');
        }
    }

    /**
     * Complete transaction (Click calls this after successful payment)
     */
    public function complete($data)
    {
        Log::info('Click Complete Request', $data);

        try {
            // Verify signature
            if (!$this->verifySignature($data)) {
                return $this->errorResponse(-1, 'Invalid signature');
            }

            $bookingId = $data['merchant_trans_id'] ?? null;
            preg_match('/BK-(\d+)-/', $bookingId, $matches);
            $actualBookingId = $matches[1] ?? null;

            if (!$actualBookingId) {
                return $this->errorResponse(-5, 'Invalid booking ID');
            }

            $booking = Booking::find($actualBookingId);

            if (!$booking) {
                return $this->errorResponse(-5, 'Booking not found');
            }

            // Check if payment already recorded
            $existingPayment = Payment::where('transaction_id', $data['click_trans_id'])->first();

            if ($existingPayment) {
                return [
                    'error' => 0,
                    'error_note' => 'Success',
                    'click_trans_id' => $data['click_trans_id'],
                    'merchant_trans_id' => $data['merchant_trans_id'],
                    'merchant_confirm_id' => $existingPayment->id,
                ];
            }

            // Create payment record
            $payment = Payment::create([
                'booking_id' => $booking->id,
                'amount' => $data['amount'] / 100, // Convert from tiyin to UZS
                'payment_method' => 'online',
                'transaction_id' => $data['click_trans_id'],
                'status' => 'completed',
                'paid_at' => now(),
                'notes' => 'Click.uz payment',
            ]);

            // Update booking status
            if ($booking->status === 'pending') {
                $booking->update(['status' => 'confirmed']);
            }

            return [
                'error' => 0,
                'error_note' => 'Success',
                'click_trans_id' => $data['click_trans_id'],
                'merchant_trans_id' => $data['merchant_trans_id'],
                'merchant_confirm_id' => $payment->id,
            ];

        } catch (\Exception $e) {
            Log::error('Click Complete Error: ' . $e->getMessage());
            return $this->errorResponse(-8, 'System error');
        }
    }

    /**
     * Verify Click signature
     */
    private function verifySignature($data)
    {
        $signString = $data['click_trans_id'] 
            . $data['service_id'] 
            . $this->secretKey 
            . $data['merchant_trans_id'] 
            . $data['amount'] 
            . $data['action'] 
            . $data['sign_time'];

        $signKey = md5($signString);

        return $signKey === ($data['sign_string'] ?? '');
    }

    /**
     * Error response format
     */
    private function errorResponse($code, $message)
    {
        return [
            'error' => $code,
            'error_note' => $message,
        ];
    }
}
