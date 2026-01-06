<?php

namespace App\Services;

use App\Models\Room;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class RoomService
{
    public function publicAvailableRooms(int $limit = 6): Collection
    {
        return Cache::remember(CacheKeys::PUBLIC_AVAILABLE_ROOMS, now()->addSeconds(60), function () use ($limit) {
            return Room::with(['roomType', 'images'])
                ->where('status', 'available')
                ->limit($limit)
                ->get()
                ->map(function ($room) {
                    $amenities = $room->roomType->amenities ?? [];
                    if (is_string($amenities)) {
                        $amenities = explode(',', $amenities);
                    }

                    return [
                        'id' => $room->id,
                        'room_number' => $room->room_number,
                        'type' => $room->roomType->name,
                        'description' => $room->description,
                        'price' => $room->roomType->base_price,
                        'capacity' => $room->roomType->capacity,
                        'image' => $room->images->first()?->image_url ?? 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
                        'amenities' => array_merge(
                            [$room->roomType->capacity . ' guests'],
                            $amenities
                        ),
                    ];
                });
        });
    }

    public function invalidatePublicRoomsCache(): void
    {
        Cache::forget(CacheKeys::PUBLIC_AVAILABLE_ROOMS);
    }
}
