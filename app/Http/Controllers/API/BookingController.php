<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\BookingService;
use App\Services\BookingQueryService;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(
        private readonly BookingService $bookingService,
        private readonly BookingQueryService $bookingQueryService,
    ) {
    }

    public function index(Request $request)
    {
        $bookings = $this->bookingQueryService->list($request->only([
            'status',
            'guest_id',
            'start_date',
            'end_date',
        ]));

        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'guest_id' => 'required|exists:guests,id',
            'room_id' => 'required|exists:rooms,id',
            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date|after:check_in_date',
            'number_of_guests' => 'required|integer|min:1',
            'special_requests' => 'nullable|string',
        ]);

        $result = $this->bookingService->create($validated);
        if ($result['error']) {
            return response()->json(['message' => $result['error']], 422);
        }

        return response()->json($result['booking'], 201);
    }

    public function show(Booking $booking)
    {
        return response()->json($booking->load(['guest', 'room.roomType', 'payments', 'services']));
    }

    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'check_in_date' => 'sometimes|date',
            'check_out_date' => 'sometimes|date|after:check_in_date',
            'number_of_guests' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:pending,confirmed,checked_in,checked_out,cancelled',
            'special_requests' => 'nullable|string',
        ]);

        // Confirmation does not require payment (cash/card payments may be recorded later).
        // Payment enforcement remains in the dedicated check-in endpoint.

        $booking->update($validated);

        return response()->json($booking->load(['guest', 'room.roomType']));
    }

    public function checkIn(Booking $booking)
    {
        $result = $this->bookingService->checkIn($booking);
        if ($result['error']) {
            return response()->json(['message' => $result['error']], 422);
        }

        return response()->json($result['booking']);
    }

    public function checkOut(Booking $booking)
    {
        $result = $this->bookingService->checkOut($booking);
        if ($result['error']) {
            return response()->json(['message' => $result['error']], 422);
        }

        return response()->json($result['booking']);
    }

    public function cancel(Booking $booking)
    {
        $result = $this->bookingService->cancel($booking);
        if ($result['error']) {
            return response()->json(['message' => $result['error']], 422);
        }

        return response()->json($result['booking']);
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();

        return response()->json(['message' => 'Booking deleted successfully']);
    }
}
