<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Services\RoomAvailabilityService;
use App\Services\RoomQueryService;
use App\Services\RoomService;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function __construct(
        private readonly RoomService $roomService,
        private readonly RoomQueryService $roomQueryService,
        private readonly RoomAvailabilityService $roomAvailabilityService,
    ) {
    }

    public function publicIndex()
    {
        return response()->json($this->roomService->publicAvailableRooms());
    }

    public function index(Request $request)
    {
        $rooms = $this->roomQueryService->list($request->only([
            'status',
            'room_type_id',
            'floor',
        ]));

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

        $this->roomService->invalidatePublicRoomsCache();

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

        $this->roomService->invalidatePublicRoomsCache();

        return response()->json($room->load('roomType'));
    }

    public function destroy(Room $room)
    {
        $room->delete();

        $this->roomService->invalidatePublicRoomsCache();

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

        $payload = $this->roomAvailabilityService->search($request->only([
            'check_in_date',
            'check_out_date',
            'room_type_id',
            'min_price',
            'max_price',
            'min_capacity',
            'floor',
            'sort_by',
        ]));

        return response()->json($payload);
    }
}
