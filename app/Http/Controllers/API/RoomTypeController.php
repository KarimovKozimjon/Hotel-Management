<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\RoomType;
use Illuminate\Http\Request;

class RoomTypeController extends Controller
{
    public function index()
    {
        $roomTypes = RoomType::withCount('rooms')->get();
        return response()->json($roomTypes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'required|integer|min:1',
            'base_price' => 'required|numeric|min:0',
            'amenities' => 'nullable|array',
        ]);

        $roomType = RoomType::create($validated);

        return response()->json($roomType, 201);
    }

    public function show(RoomType $roomType)
    {
        return response()->json($roomType->load('rooms'));
    }

    public function update(Request $request, RoomType $roomType)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'sometimes|integer|min:1',
            'base_price' => 'sometimes|numeric|min:0',
            'amenities' => 'nullable|array',
        ]);

        $roomType->update($validated);

        return response()->json($roomType);
    }

    public function destroy(RoomType $roomType)
    {
        $roomType->delete();

        return response()->json(['message' => 'Room type deleted successfully']);
    }
}
