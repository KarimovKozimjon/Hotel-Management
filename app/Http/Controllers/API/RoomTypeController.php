<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\RoomType;
use App\Services\RoomTypeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RoomTypeController extends Controller
{
    public function __construct(private readonly RoomTypeService $roomTypeService)
    {
    }

    public function publicIndex()
    {
        return response()->json($this->roomTypeService->publicRoomTypes());
    }

    public function index()
    {
        return response()->json($this->roomTypeService->indexWithRoomCounts());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'required|integer|min:1',
            'base_price' => 'required|numeric|min:0',
            'amenities' => 'nullable',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'image_url' => 'nullable|url',
        ]);

        // Parse amenities if it's a JSON string
        if (isset($validated['amenities']) && is_string($validated['amenities'])) {
            $validated['amenities'] = json_decode($validated['amenities'], true);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('room-types', 'public');
            $validated['image_url'] = Storage::url($path);
        } elseif ($request->has('image_url')) {
            $validated['image_url'] = $request->image_url;
        }

        unset($validated['image']);
        $roomType = RoomType::create($validated);

        $this->roomTypeService->invalidateCaches();

        return response()->json($roomType, 201);
    }

    public function show(RoomType $roomType)
    {
        return response()->json($roomType->load('rooms'));
    }

    public function update(Request $request, $id)
    {
        $roomType = RoomType::findOrFail($id);

        if (config('app.debug')) {
            \Log::info('Updating room type', [
                'id' => $id,
                'request_data' => $request->all(),
                'amenities_raw' => $request->input('amenities'),
            ]);
        }
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'sometimes|integer|min:1',
            'base_price' => 'sometimes|numeric|min:0',
            'amenities' => 'nullable',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'image_url' => 'nullable|url',
        ]);

        // Parse amenities if it's a JSON string
        if (isset($validated['amenities']) && is_string($validated['amenities'])) {
            $validated['amenities'] = json_decode($validated['amenities'], true);
        }
        
        if (config('app.debug')) {
            \Log::info('Parsed amenities', ['amenities' => $validated['amenities'] ?? null]);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($roomType->image_url && !filter_var($roomType->image_url, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $roomType->image_url));
            }
            
            $path = $request->file('image')->store('room-types', 'public');
            $validated['image_url'] = Storage::url($path);
        } elseif ($request->has('image_url')) {
            $validated['image_url'] = $request->image_url;
        }

        unset($validated['image']);
        $roomType->update($validated);

        // Refresh the model to get updated data
        $roomType->refresh();

        $this->roomTypeService->invalidateCaches();

        if (config('app.debug')) {
            \Log::info('Room type updated', ['result' => $roomType->toArray()]);
        }

        return response()->json($roomType);
    }

    public function destroy(RoomType $roomType)
    {
        $roomType->delete();

        $this->roomTypeService->invalidateCaches();

        return response()->json(['message' => 'Room type deleted successfully']);
    }
}
