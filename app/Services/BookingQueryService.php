<?php

namespace App\Services;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class BookingQueryService
{
    public function query(array $filters = []): Builder
    {
        $query = Booking::with(['guest', 'room.roomType', 'payments']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['guest_id'])) {
            $query->where('guest_id', $filters['guest_id']);
        }

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->whereBetween('check_in_date', [$filters['start_date'], $filters['end_date']]);
        }

        return $query;
    }

    public function list(array $filters = []): Collection
    {
        return $this->query($filters)->latest()->get();
    }
}
