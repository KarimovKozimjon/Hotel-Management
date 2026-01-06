<?php

namespace App\Services;

use App\Models\Room;
use Illuminate\Support\Collection;

class RoomAvailabilityService
{
    public function search(array $filters): array
    {
        $query = Room::where('status', 'available')
            ->whereDoesntHave('bookings', function ($query) use ($filters) {
                $query->whereIn('status', ['confirmed', 'checked_in'])
                    ->where('check_in_date', '<', $filters['check_out_date'])
                    ->where('check_out_date', '>', $filters['check_in_date']);
            });

        if (!empty($filters['room_type_id'])) {
            $query->where('room_type_id', $filters['room_type_id']);
        }

        if (!empty($filters['floor'])) {
            $query->where('floor', $filters['floor']);
        }

        $query->with(['roomType', 'images']);

        /** @var Collection $rooms */
        $rooms = $query->get();

        if (isset($filters['min_price']) && $filters['min_price'] !== null && $filters['min_price'] !== '') {
            $rooms = $rooms->filter(function ($room) use ($filters) {
                return $room->roomType && $room->roomType->base_price >= $filters['min_price'];
            });
        }

        if (isset($filters['max_price']) && $filters['max_price'] !== null && $filters['max_price'] !== '') {
            $rooms = $rooms->filter(function ($room) use ($filters) {
                return $room->roomType && $room->roomType->base_price <= $filters['max_price'];
            });
        }

        if (isset($filters['min_capacity']) && $filters['min_capacity'] !== null && $filters['min_capacity'] !== '') {
            $rooms = $rooms->filter(function ($room) use ($filters) {
                return $room->roomType && $room->roomType->capacity >= $filters['min_capacity'];
            });
        }

        if (!empty($filters['sort_by'])) {
            switch ($filters['sort_by']) {
                case 'price_asc':
                    $rooms = $rooms->sortBy(fn ($room) => $room->roomType ? $room->roomType->base_price : 0);
                    break;
                case 'price_desc':
                    $rooms = $rooms->sortByDesc(fn ($room) => $room->roomType ? $room->roomType->base_price : 0);
                    break;
                case 'capacity_asc':
                    $rooms = $rooms->sortBy(fn ($room) => $room->roomType ? $room->roomType->capacity : 0);
                    break;
                case 'capacity_desc':
                    $rooms = $rooms->sortByDesc(fn ($room) => $room->roomType ? $room->roomType->capacity : 0);
                    break;
                case 'floor':
                    $rooms = $rooms->sortBy('floor');
                    break;
            }
        }

        return [
            'data' => $rooms->values(),
            'filters_applied' => [
                'room_type_id' => $filters['room_type_id'] ?? null,
                'min_price' => $filters['min_price'] ?? null,
                'max_price' => $filters['max_price'] ?? null,
                'min_capacity' => $filters['min_capacity'] ?? null,
                'floor' => $filters['floor'] ?? null,
                'sort_by' => $filters['sort_by'] ?? null,
            ],
            'total_results' => $rooms->count(),
        ];
    }
}
