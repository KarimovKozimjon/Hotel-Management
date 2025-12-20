<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['guest', 'room.roomType', 'payments']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by guest
        if ($request->has('guest_id')) {
            $query->where('guest_id', $request->guest_id);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('check_in_date', [$request->start_date, $request->end_date]);
        }

        $bookings = $query->latest()->paginate(15);

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

        // Check room availability
        $isAvailable = !Booking::where('room_id', $validated['room_id'])
            ->where(function ($query) use ($validated) {
                $query->whereBetween('check_in_date', [$validated['check_in_date'], $validated['check_out_date']])
                      ->orWhereBetween('check_out_date', [$validated['check_in_date'], $validated['check_out_date']])
                      ->orWhere(function ($q) use ($validated) {
                          $q->where('check_in_date', '<=', $validated['check_in_date'])
                            ->where('check_out_date', '>=', $validated['check_out_date']);
                      });
            })
            ->whereIn('status', ['confirmed', 'checked_in'])
            ->exists();

        if (!$isAvailable) {
            return response()->json(['message' => 'Room is not available for selected dates'], 422);
        }

        // Calculate total amount
        $room = Room::with('roomType')->find($validated['room_id']);
        $checkIn = new \DateTime($validated['check_in_date']);
        $checkOut = new \DateTime($validated['check_out_date']);
        $nights = $checkOut->diff($checkIn)->days;
        $totalAmount = $nights * $room->roomType->base_price;

        $booking = Booking::create([
            'booking_number' => 'BK-' . strtoupper(Str::random(8)),
            'guest_id' => $validated['guest_id'],
            'room_id' => $validated['room_id'],
            'check_in_date' => $validated['check_in_date'],
            'check_out_date' => $validated['check_out_date'],
            'number_of_guests' => $validated['number_of_guests'],
            'total_amount' => $totalAmount,
            'special_requests' => $validated['special_requests'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json($booking->load(['guest', 'room.roomType']), 201);
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

        $booking->update($validated);

        return response()->json($booking->load(['guest', 'room.roomType']));
    }

    public function checkIn(Booking $booking)
    {
        if ($booking->status !== 'confirmed') {
            return response()->json(['message' => 'Only confirmed bookings can be checked in'], 422);
        }

        $booking->update([
            'status' => 'checked_in',
            'checked_in_at' => now(),
        ]);

        $booking->room->update(['status' => 'occupied']);

        return response()->json($booking->load(['guest', 'room']));
    }

    public function checkOut(Booking $booking)
    {
        if ($booking->status !== 'checked_in') {
            return response()->json(['message' => 'Only checked-in bookings can be checked out'], 422);
        }

        $booking->update([
            'status' => 'checked_out',
            'checked_out_at' => now(),
        ]);

        $booking->room->update(['status' => 'cleaning']);

        return response()->json($booking->load(['guest', 'room']));
    }

    public function cancel(Booking $booking)
    {
        if (in_array($booking->status, ['checked_in', 'checked_out'])) {
            return response()->json(['message' => 'Cannot cancel checked-in or checked-out bookings'], 422);
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json($booking);
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();

        return response()->json(['message' => 'Booking deleted successfully']);
    }
}
