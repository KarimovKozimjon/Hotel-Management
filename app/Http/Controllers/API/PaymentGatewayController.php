<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\ClickPaymentService;
use App\Services\PaymePaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentGatewayController extends Controller
{
    protected $clickService;
    protected $paymeService;

    public function __construct(
        ClickPaymentService $clickService,
        PaymePaymentService $paymeService
    ) {
        $this->clickService = $clickService;
        $this->paymeService = $paymeService;
    }

    /**
     * Initiate payment with selected gateway
     */
    public function initiate(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'amount' => 'required|numeric|min:0',
            'gateway' => 'required|in:click,payme',
            'return_url' => 'nullable|url',
        ]);

        $bookingId = $request->booking_id;
        $amount = $request->amount;
        $gateway = $request->gateway;
        $returnUrl = $request->return_url;

        try {
            $paymentUrl = match($gateway) {
                'click' => $this->clickService->generatePaymentUrl($bookingId, $amount, $returnUrl),
                'payme' => $this->paymeService->generatePaymentUrl($bookingId, $amount, $returnUrl),
                default => throw new \Exception('Invalid gateway'),
            };

            return response()->json([
                'success' => true,
                'payment_url' => $paymentUrl,
                'gateway' => $gateway,
            ]);

        } catch (\Exception $e) {
            Log::error('Payment initiation error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate payment',
            ], 500);
        }
    }

    /**
     * Click webhook - Prepare
     */
    public function clickPrepare(Request $request)
    {
        $response = $this->clickService->prepare($request->all());
        return response()->json($response);
    }

    /**
     * Click webhook - Complete
     */
    public function clickComplete(Request $request)
    {
        $response = $this->clickService->complete($request->all());
        return response()->json($response);
    }

    /**
     * Payme webhook - handles all Payme methods
     */
    public function paymeWebhook(Request $request)
    {
        $response = $this->paymeService->handleWebhook($request);
        return response()->json($response);
    }

    /**
     * Payment callback - user returns after payment
     */
    public function clickCallback(Request $request)
    {
        $merchantTransId = $request->merchant_trans_id;
        
        // Redirect to frontend with success message
        $frontendUrl = config('app.frontend_url', 'http://localhost:3001');
        return redirect($frontendUrl . '/guest/my-bookings?payment=success&transaction=' . $merchantTransId);
    }

    /**
     * Payme callback
     */
    public function paymeCallback(Request $request)
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3001');
        return redirect($frontendUrl . '/guest/my-bookings?payment=success');
    }

    /**
     * Check payment status
     */
    public function checkStatus(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
        ]);

        $booking = \App\Models\Booking::with('payments')
            ->findOrFail($request->booking_id);

        $payment = $booking->payments()
            ->where('status', 'completed')
            ->latest()
            ->first();

        return response()->json([
            'paid' => $payment !== null,
            'payment' => $payment,
            'booking_status' => $booking->status,
        ]);
    }
}
