<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\PaymentReceipt;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with('booking.guest');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by payment method
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        // Filter by booking
        if ($request->filled('booking_id')) {
            $query->where('booking_id', $request->booking_id);
        }

        $payments = $query->latest()->get();

        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,card',
            'transaction_id' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $payment = Payment::create([
            'booking_id' => $validated['booking_id'],
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'transaction_id' => $validated['transaction_id'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => 'completed',
            'paid_at' => now(),
        ]);

        // Send payment receipt email
        $payment->load('booking.guest');
        try {
            Mail::to($payment->booking->guest->email)->send(new PaymentReceipt($payment));
        } catch (\Exception $e) {
            \Log::error('Failed to send payment receipt email: ' . $e->getMessage());
        }

        return response()->json($payment->load('booking'), 201);
    }

    public function show(Payment $payment)
    {
        return response()->json($payment->load('booking.guest'));
    }

    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'amount' => 'sometimes|numeric|min:0',
            'payment_method' => 'sometimes|in:cash,card',
            'status' => 'sometimes|in:pending,completed,failed,refunded',
            'transaction_id' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $payment->update($validated);

        return response()->json($payment->load('booking'));
    }

    public function destroy(Payment $payment)
    {
        $payment->delete();

        return response()->json(['message' => 'Payment deleted successfully']);
    }

    /**
     * Get payments for authenticated guest
     */
    public function guestPayments(Request $request)
    {
        $guest = $request->user();
        
        if (!$guest) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $payments = Payment::whereHas('booking', function ($query) use ($guest) {
            $query->where('guest_id', $guest->id);
        })
        ->with(['booking.room.roomType'])
        ->latest()
        ->get();

        return response()->json([
            'data' => $payments,
            'total' => $payments->count()
        ]);
    }
}
