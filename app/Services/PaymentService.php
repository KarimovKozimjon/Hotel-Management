<?php

namespace App\Services;

use App\Mail\PaymentReceipt;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class PaymentService
{
    public function __construct(private readonly DashboardService $dashboardService)
    {
    }

    public function create(array $validated): Payment
    {
        $payment = DB::transaction(function () use ($validated) {
            return Payment::create([
                'booking_id' => $validated['booking_id'],
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'transaction_id' => $validated['transaction_id'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'status' => 'completed',
                'paid_at' => now(),
            ]);
        });

        $this->dashboardService->invalidateCaches();

        $payment->load('booking.guest');
        try {
            Mail::to($payment->booking->guest->email)->send(new PaymentReceipt($payment));
        } catch (\Exception $e) {
            \Log::error('Failed to send payment receipt email: ' . $e->getMessage());
        }

        return $payment;
    }

    public function update(Payment $payment, array $validated): Payment
    {
        DB::transaction(function () use ($payment, $validated) {
            $payment->refresh();
            $payment->update($validated);
        });
        $this->dashboardService->invalidateCaches();

        return $payment;
    }

    public function delete(Payment $payment): void
    {
        DB::transaction(function () use ($payment) {
            $payment->refresh();
            $payment->delete();
        });
        $this->dashboardService->invalidateCaches();
    }
}
