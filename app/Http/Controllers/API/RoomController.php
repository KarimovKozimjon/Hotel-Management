<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
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
            'images' => 'nullable|array',
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
            'images' => 'nullable|array',
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
        ]);

        $query = Room::where('status', 'available')
            ->whereDoesntHave('bookings', function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->whereBetween('check_in_date', [$request->check_in_date, $request->check_out_date])
                      ->orWhereBetween('check_out_date', [$request->check_in_date, $request->check_out_date])
                      ->orWhere(function ($q) use ($request) {
                          $q->where('check_in_date', '<=', $request->check_in_date)
                            ->where('check_out_date', '>=', $request->check_out_date);
                      });
                })->whereIn('status', ['confirmed', 'checked_in']);
            });

        if ($request->has('room_type_id')) {
            $query->where('room_type_id', $request->room_type_id);
        }

        $rooms = $query->with('roomType')->get();

        return response()->json($rooms);
    }
}
