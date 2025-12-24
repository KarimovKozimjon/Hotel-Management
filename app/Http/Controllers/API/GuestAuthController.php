<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class GuestAuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:guests',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'required|string',
            'passport_number' => 'required|string|unique:guests',
            'date_of_birth' => 'required|date',
            'nationality' => 'required|string',
            'address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $guest = Guest::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'passport_number' => $request->passport_number,
            'date_of_birth' => $request->date_of_birth,
            'nationality' => $request->nationality,
            'address' => $request->address,
        ]);

        $token = $guest->createToken('guest-token')->plainTextToken;

        return response()->json([
            'guest' => $guest,
            'token' => $token,
            'message' => 'Registration successful'
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $guest = Guest::where('email', $request->email)->first();

        if (!$guest || !Hash::check($request->password, $guest->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        $token = $guest->createToken('guest-token')->plainTextToken;

        return response()->json([
            'guest' => $guest,
            'token' => $token,
            'message' => 'Login successful'
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $guest = $request->user();
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string',
            'passport_number' => 'sometimes|string|unique:guests,passport_number,' . $guest->id,
            'date_of_birth' => 'sometimes|date',
            'nationality' => 'sometimes|string',
            'address' => 'nullable|string',
        ]);
        $guest->update($validated);
        return response()->json($guest);
    }

    public function myBookings(Request $request)
    {
        $bookings = $request->user()->bookings()
            ->with(['room.roomType', 'payments', 'services'])
            ->latest()
            ->get();

        return response()->json(['data' => $bookings]);
    }

    public function myReviews(Request $request)
    {
        $reviews = $request->user()->reviews()
            ->with(['booking.room'])
            ->latest()
            ->get();

        return response()->json(['data' => $reviews]);
    }
}
