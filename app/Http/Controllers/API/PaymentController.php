<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PaymentQueryService;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentQueryService $paymentQueryService,
        private readonly PaymentService $paymentService,
    ) {
    }

    public function index(Request $request)
    {
        $payments = $this->paymentQueryService->list($request->only([
            'status',
            'payment_method',
            'booking_id',
        ]));

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

        $payment = $this->paymentService->create($validated);

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

        $payment = $this->paymentService->update($payment, $validated);

        return response()->json($payment->load('booking'));
    }

    public function destroy(Payment $payment)
    {
        $this->paymentService->delete($payment);

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

        $payments = $this->paymentQueryService->listForGuest($guest->id);

        return response()->json([
            'data' => $payments,
            'total' => $payments->count()
        ]);
    }
}
