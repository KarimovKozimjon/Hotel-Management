<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\RoomImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RoomImageController extends Controller
{
    public function index($roomId)
    {
        $images = RoomImage::where('room_id', $roomId)->orderBy('order')->get();
        return response()->json($images);
    }

    public function store(Request $request, $roomId)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
            'is_primary' => 'boolean',
            'order' => 'integer'
        ]);

        $room = Room::findOrFail($roomId);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('room-images', 'public');

            // If this is marked as primary, unset other primary images
            if ($request->is_primary) {
                RoomImage::where('room_id', $roomId)->update(['is_primary' => false]);
            }

            $image = RoomImage::create([
                'room_id' => $roomId,
                'image_path' => $path,
                'is_primary' => $request->is_primary ?? false,
                'order' => $request->order ?? 0
            ]);

            return response()->json([
                'message' => 'Image uploaded successfully',
                'image' => $image
            ], 201);
        }

        return response()->json(['message' => 'No image provided'], 400);
    }

    public function update(Request $request, $roomId, $imageId)
    {
        $request->validate([
            'is_primary' => 'boolean',
            'order' => 'integer'
        ]);

        $image = RoomImage::where('room_id', $roomId)->findOrFail($imageId);

        // If setting as primary, unset other primary images
        if ($request->has('is_primary') && $request->is_primary) {
            RoomImage::where('room_id', $roomId)->where('id', '!=', $imageId)->update(['is_primary' => false]);
        }

        $image->update($request->only(['is_primary', 'order']));

        return response()->json([
            'message' => 'Image updated successfully',
            'image' => $image
        ]);
    }

    public function destroy($roomId, $imageId)
    {
        $image = RoomImage::where('room_id', $roomId)->findOrFail($imageId);

        // Delete file from storage
        if (Storage::disk('public')->exists($image->image_path)) {
            Storage::disk('public')->delete($image->image_path);
        }

        $image->delete();

        return response()->json(['message' => 'Image deleted successfully']);
    }

    public function setPrimary($roomId, $imageId)
    {
        // Unset all primary images for this room
        RoomImage::where('room_id', $roomId)->update(['is_primary' => false]);

        // Set this image as primary
        $image = RoomImage::where('room_id', $roomId)->findOrFail($imageId);
        $image->update(['is_primary' => true]);

        return response()->json([
            'message' => 'Primary image set successfully',
            'image' => $image
        ]);
    }

    public function reorder(Request $request, $roomId)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*.id' => 'required|exists:room_images,id',
            'images.*.order' => 'required|integer'
        ]);

        foreach ($request->images as $imageData) {
            RoomImage::where('room_id', $roomId)
                ->where('id', $imageData['id'])
                ->update(['order' => $imageData['order']]);
        }

        return response()->json(['message' => 'Images reordered successfully']);
    }
}
