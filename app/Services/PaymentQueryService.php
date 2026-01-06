<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class PaymentQueryService
{
    public function query(array $filters = []): Builder
    {
        $query = Payment::with('booking.guest');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }

        if (!empty($filters['booking_id'])) {
            $query->where('booking_id', $filters['booking_id']);
        }

        return $query;
    }

    public function list(array $filters = []): Collection
    {
        return $this->query($filters)->latest()->get();
    }

    public function listForGuest(int|string $guestId): Collection
    {
        return Payment::whereHas('booking', function ($query) use ($guestId) {
            $query->where('guest_id', $guestId);
        })
            ->with(['booking.room.roomType'])
            ->latest()
            ->get();
    }
}
