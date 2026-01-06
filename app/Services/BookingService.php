<?php

namespace App\Services;

use App\Mail\BookingCancelled;
use App\Mail\BookingConfirmation;
use App\Mail\CheckInReminder;
use App\Models\Booking;
use App\Models\Room;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class BookingService
{
    public function __construct(
        private readonly RoomService $roomService,
        private readonly DashboardService $dashboardService,
    ) {
    }

    /**
     * @return array{booking: Booking|null, error: string|null}
     */
    public function create(array $validated): array
    {
        $result = DB::transaction(function () use ($validated) {
            // Lock the room row to reduce race conditions under concurrent bookings.
            $room = Room::with('roomType')->lockForUpdate()->find($validated['room_id']);

            $isAvailable = !Booking::where('room_id', $validated['room_id'])
                ->whereIn('status', ['confirmed', 'checked_in'])
                ->where('check_in_date', '<', $validated['check_out_date'])
                ->where('check_out_date', '>', $validated['check_in_date'])
                ->exists();

            if (!$isAvailable) {
                return ['booking' => null, 'error' => 'Room is not available for selected dates'];
            }

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

            return ['booking' => $booking, 'error' => null];
        });

        if ($result['error']) {
            return $result;
        }

        /** @var Booking $booking */
        $booking = $result['booking'];
        $booking->load(['guest', 'room.roomType']);
        try {
            Mail::to($booking->guest->email)->send(new BookingConfirmation($booking));
        } catch (\Exception $e) {
            \Log::error('Failed to send booking confirmation email: ' . $e->getMessage());
        }

        return ['booking' => $booking, 'error' => null];
    }

    /**
     * @return array{booking: Booking|null, error: string|null}
     */
    public function checkIn(Booking $booking): array
    {
        if ($booking->status !== 'confirmed') {
            return ['booking' => null, 'error' => 'Only confirmed bookings can be checked in'];
        }

        $hasCompletedPayment = $booking->payments()
            ->where('status', 'completed')
            ->exists();

        if (!$hasCompletedPayment) {
            return ['booking' => null, 'error' => 'Booking cannot be checked in until payment is completed'];
        }

        DB::transaction(function () use ($booking) {
            $booking->refresh();

            $booking->update([
                'status' => 'checked_in',
                'checked_in_at' => now(),
            ]);

            $booking->room()->lockForUpdate()->first()?->update(['status' => 'occupied']);
        });

        $this->roomService->invalidatePublicRoomsCache();
        $this->dashboardService->invalidateCaches();

        $booking->load(['guest', 'room.roomType']);
        try {
            Mail::to($booking->guest->email)->send(new CheckInReminder($booking));
        } catch (\Exception $e) {
            \Log::error('Failed to send check-in email: ' . $e->getMessage());
        }

        return ['booking' => $booking->load(['guest', 'room']), 'error' => null];
    }

    /**
     * @return array{booking: Booking|null, error: string|null}
     */
    public function checkOut(Booking $booking): array
    {
        if ($booking->status !== 'checked_in') {
            return ['booking' => null, 'error' => 'Only checked-in bookings can be checked out'];
        }

        DB::transaction(function () use ($booking) {
            $booking->refresh();

            $booking->update([
                'status' => 'checked_out',
                'checked_out_at' => now(),
            ]);

            $booking->room()->lockForUpdate()->first()?->update(['status' => 'cleaning']);
        });

        $this->roomService->invalidatePublicRoomsCache();
        $this->dashboardService->invalidateCaches();

        return ['booking' => $booking->load(['guest', 'room']), 'error' => null];
    }

    /**
     * @return array{booking: Booking|null, error: string|null}
     */
    public function cancel(Booking $booking): array
    {
        if (in_array($booking->status, ['checked_in', 'checked_out'], true)) {
            return ['booking' => null, 'error' => 'Cannot cancel checked-in or checked-out bookings'];
        }

        DB::transaction(function () use ($booking) {
            $booking->refresh();
            $booking->update(['status' => 'cancelled']);
        });

        $booking->load(['guest', 'room.roomType']);
        try {
            Mail::to($booking->guest->email)->send(new BookingCancelled($booking));
        } catch (\Exception $e) {
            \Log::error('Failed to send cancellation email: ' . $e->getMessage());
        }

        return ['booking' => $booking, 'error' => null];
    }
}
