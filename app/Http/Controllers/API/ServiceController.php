<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Service::query();

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $services = $query->get();

        return response()->json($services);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|in:room_service,laundry,restaurant,spa,transport,other',
            'is_active' => 'boolean',
        ]);

        $service = Service::create($validated);

        return response()->json($service, 201);
    }

    public function show(Service $service)
    {
        return response()->json($service);
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'category' => 'sometimes|in:room_service,laundry,restaurant,spa,transport,other',
            'is_active' => 'boolean',
        ]);

        $service->update($validated);

        return response()->json($service);
    }

    public function destroy(Service $service)
    {
        $service->delete();

        return response()->json(['message' => 'Service deleted successfully']);
    }

    public function addToBooking(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'service_id' => 'required|exists:services,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $booking = \App\Models\Booking::find($validated['booking_id']);
        
        // Check if booking is in valid status
        if (in_array($booking->status, ['cancelled', 'completed'])) {
            return response()->json([
                'message' => 'Cannot add service to a cancelled or completed booking'
            ], 422);
        }

        $service = Service::findOrFail($validated['service_id']);
        
        // Check if service is active
        if (!$service->is_active) {
            return response()->json([
                'message' => 'This service is currently not available'
            ], 422);
        }

        // Check if service already exists in booking
        if ($booking->services()->where('service_id', $validated['service_id'])->exists()) {
            // Update quantity instead of creating duplicate
            $existingService = $booking->services()->where('service_id', $validated['service_id'])->first();
            $oldTotal = $existingService->pivot->total;
            $newQuantity = $existingService->pivot->quantity + $validated['quantity'];
            $newTotal = $service->price * $newQuantity;
            
            $booking->services()->updateExistingPivot($validated['service_id'], [
                'quantity' => $newQuantity,
                'price' => $service->price,
                'total' => $newTotal,
            ]);
            
            // Update booking total amount
            $booking->total_amount = $booking->total_amount - $oldTotal + $newTotal;
            $booking->save();
            
            return response()->json([
                'message' => 'Service quantity updated successfully',
                'booking' => $booking->load('services')
            ]);
        }

        $total = $service->price * $validated['quantity'];

        $booking->services()->attach($validated['service_id'], [
            'quantity' => $validated['quantity'],
            'price' => $service->price,
            'total' => $total,
        ]);

        // Update booking total amount
        $booking->total_amount = $booking->total_amount + $total;
        $booking->save();

        return response()->json([
            'message' => 'Service added to booking successfully',
            'booking' => $booking->load('services')
        ]);
    }
}
