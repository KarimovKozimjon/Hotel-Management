<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function publicIndex()
    {
        // Public endpoint for homepage - show only available rooms with their types
        $rooms = Room::with(['roomType', 'images'])
            ->where('status', 'available')
            ->limit(6)
            ->get()
            ->map(function ($room) {
                // Handle amenities - can be array or string
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

        return response()->json($rooms);
    }

    public function index(Request $request)
    {
        $query = Room::with('roomType');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by room type
        if ($request->has('room_type_id')) {
            $query->where('room_type_id', $request->room_type_id);
        }

        // Filter by floor
        if ($request->has('floor')) {
            $query->where('floor', $request->floor);
        }

        $rooms = $query->get();

        return response()->json($rooms);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_number' => 'required|string|unique:rooms',
            'room_type_id' => 'required|exists:room_types,id',
            'floor' => 'required|integer',
            'status' => 'required|in:available,occupied,maintenance,cleaning',
            'description' => 'nullable|string',
        ]);

        $room = Room::create($validated);

        return response()->json($room->load('roomType'), 201);
    }

    public function show(Room $room)
    {
        return response()->json($room->load('roomType', 'bookings'));
    }

    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'room_number' => 'sometimes|string|unique:rooms,room_number,' . $room->id,
            'room_type_id' => 'sometimes|exists:room_types,id',
            'floor' => 'sometimes|integer',
            'status' => 'sometimes|in:available,occupied,maintenance,cleaning',
            'description' => 'nullable|string',
        ]);

        $room->update($validated);

        return response()->json($room->load('roomType'));
    }

    public function destroy(Room $room)
    {
        $room->delete();

        return response()->json(['message' => 'Room deleted successfully']);
    }

    public function available(Request $request)
    {
        $request->validate([
            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date|after:check_in_date',
            'room_type_id' => 'nullable|exists:room_types,id',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'min_capacity' => 'nullable|integer|min:1',
            'floor' => 'nullable|integer',
            'sort_by' => 'nullable|in:price_asc,price_desc,capacity_asc,capacity_desc,floor',
        ]);

        $query = Room::where('status', 'available')
            ->whereDoesntHave('bookings', function ($query) use ($request) {
                // Overlap check using a half-open interval: [check_in, check_out)
                // Existing booking overlaps requested range if:
                // existing.check_in < requested.check_out AND existing.check_out > requested.check_in
                $query->whereIn('status', ['confirmed', 'checked_in'])
                    ->where('check_in_date', '<', $request->check_out_date)
                    ->where('check_out_date', '>', $request->check_in_date);
            });

        // Filter by room type
        if ($request->filled('room_type_id')) {
            $query->where('room_type_id', $request->room_type_id);
        }

        // Filter by floor
        if ($request->filled('floor')) {
            $query->where('floor', $request->floor);
        }

        // Load room type for price and capacity filtering
        $query->with(['roomType', 'images']);

        $rooms = $query->get();

        // Filter by price range (from room_type)
        if ($request->filled('min_price')) {
            $rooms = $rooms->filter(function ($room) use ($request) {
                return $room->roomType && $room->roomType->base_price >= $request->min_price;
            });
        }

        if ($request->filled('max_price')) {
            $rooms = $rooms->filter(function ($room) use ($request) {
                return $room->roomType && $room->roomType->base_price <= $request->max_price;
            });
        }

        // Filter by capacity
        if ($request->filled('min_capacity')) {
            $rooms = $rooms->filter(function ($room) use ($request) {
                return $room->roomType && $room->roomType->capacity >= $request->min_capacity;
            });
        }

        // Sorting
        if ($request->filled('sort_by')) {
            switch ($request->sort_by) {
                case 'price_asc':
                    $rooms = $rooms->sortBy(function ($room) {
                        return $room->roomType ? $room->roomType->base_price : 0;
                    });
                    break;
                case 'price_desc':
                    $rooms = $rooms->sortByDesc(function ($room) {
                        return $room->roomType ? $room->roomType->base_price : 0;
                    });
                    break;
                case 'capacity_asc':
                    $rooms = $rooms->sortBy(function ($room) {
                        return $room->roomType ? $room->roomType->capacity : 0;
                    });
                    break;
                case 'capacity_desc':
                    $rooms = $rooms->sortByDesc(function ($room) {
                        return $room->roomType ? $room->roomType->capacity : 0;
                    });
                    break;
                case 'floor':
                    $rooms = $rooms->sortBy('floor');
                    break;
            }
        }

        return response()->json([
            'data' => $rooms->values(),
            'filters_applied' => [
                'room_type_id' => $request->room_type_id,
                'min_price' => $request->min_price,
                'max_price' => $request->max_price,
                'min_capacity' => $request->min_capacity,
                'floor' => $request->floor,
                'sort_by' => $request->sort_by,
            ],
            'total_results' => $rooms->count(),
        ]);
    }
}
