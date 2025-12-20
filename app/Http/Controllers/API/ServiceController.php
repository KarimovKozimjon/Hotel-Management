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

        $service = Service::find($validated['service_id']);
        $total = $service->price * $validated['quantity'];

        $booking = \App\Models\Booking::find($validated['booking_id']);
        $booking->services()->attach($validated['service_id'], [
            'quantity' => $validated['quantity'],
            'price' => $service->price,
            'total' => $total,
        ]);

        // Update booking total amount
        $booking->increment('total_amount', $total);

        return response()->json(['message' => 'Service added to booking successfully']);
    }
}
