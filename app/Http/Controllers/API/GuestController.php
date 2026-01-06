<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Services\GuestQueryService;
use App\Services\GuestService;
use Illuminate\Http\Request;

class GuestController extends Controller
{
    public function __construct(
        private readonly GuestQueryService $guestQueryService,
        private readonly GuestService $guestService,
    ) {
    }

    public function index(Request $request)
    {
        $guests = $this->guestQueryService->list($request->only(['search']));

        return response()->json($guests);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:guests',
            'phone' => 'required|string',
            'passport_number' => 'required|string|unique:guests',
            'date_of_birth' => 'required|date',
            'nationality' => 'required|string',
            'address' => 'nullable|string',
        ]);

        $guest = $this->guestService->create($validated);

        return response()->json($guest, 201);
    }

    public function show(Guest $guest)
    {
        return response()->json($guest->load(['bookings.room.roomType', 'reviews']));
    }

    public function update(Request $request, Guest $guest)
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:guests,email,' . $guest->id,
            'phone' => 'sometimes|string',
            'passport_number' => 'sometimes|string|unique:guests,passport_number,' . $guest->id,
            'date_of_birth' => 'sometimes|date',
            'nationality' => 'sometimes|string',
            'address' => 'nullable|string',
        ]);

        $guest = $this->guestService->update($guest, $validated);

        return response()->json($guest);
    }

    public function destroy(Guest $guest)
    {
        $this->guestService->delete($guest);

        return response()->json(['message' => 'Guest deleted successfully']);
    }
}
