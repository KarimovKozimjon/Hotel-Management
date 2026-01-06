<?php

namespace App\Services;

use App\Models\Review;
use Illuminate\Support\Collection;

class ReviewQueryService
{
    public function list(): Collection
    {
        return Review::with(['booking.room', 'guest'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function find(int|string $id): ?Review
    {
        return Review::with(['booking.room', 'guest'])->find($id);
    }

    public function findByBooking(int|string $bookingId): ?Review
    {
        return Review::with(['booking.room', 'guest'])
            ->where('booking_id', $bookingId)
            ->first();
    }

    public function listByGuest(int|string $guestId): Collection
    {
        return Review::with(['booking.room', 'guest'])
            ->where('guest_id', $guestId)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
