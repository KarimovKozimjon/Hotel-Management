<?php

namespace App\Services;

use App\Models\Room;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class RoomQueryService
{
    public function query(array $filters = []): Builder
    {
        $query = Room::with('roomType');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['room_type_id'])) {
            $query->where('room_type_id', $filters['room_type_id']);
        }

        if (!empty($filters['floor'])) {
            $query->where('floor', $filters['floor']);
        }

        return $query;
    }

    public function list(array $filters = []): Collection
    {
        return $this->query($filters)->get();
    }
}
