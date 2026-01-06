<?php

namespace App\Services;

use App\Models\RoomType;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class RoomTypeService
{
    public function publicRoomTypes(): Collection
    {
        return Cache::remember(CacheKeys::PUBLIC_ROOM_TYPES, now()->addSeconds(60), function () {
            return RoomType::all()->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'description' => $type->description,
                    'capacity' => $type->capacity,
                    'price' => $type->base_price,
                    'image' => $type->image_url ?? 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
                    'amenities' => $type->amenities ?? [],
                ];
            });
        });
    }

    public function indexWithRoomCounts(): Collection
    {
        return Cache::remember(CacheKeys::ROOM_TYPES_INDEX, now()->addSeconds(10), function () {
            return RoomType::withCount('rooms')->get();
        });
    }

    public function invalidateCaches(): void
    {
        Cache::forget(CacheKeys::PUBLIC_ROOM_TYPES);
        Cache::forget(CacheKeys::ROOM_TYPES_INDEX);
    }
}
