<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\GuestAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GuestAuthController extends Controller
{
    public function __construct(private readonly GuestAuthService $guestAuthService)
    {
    }

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

        $payload = $this->guestAuthService->register($validator->validated());

        return response()->json([
            'guest' => $payload['guest'],
            'token' => $payload['token'],
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

        $payload = $this->guestAuthService->login(
            $request->email,
            $request->password,
            $request->ip(),
            $request->userAgent(),
        );

        if (!$payload['guest']) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        return response()->json([
            'guest' => $payload['guest'],
            'token' => $payload['token'],
            'message' => 'Login successful'
        ]);
    }

    public function logout(Request $request)
    {
        $this->guestAuthService->logout($request->user());

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

        return response()->json($this->guestAuthService->updateProfile($guest, $validated));
    }

    public function myBookings(Request $request)
    {
        $bookings = $this->guestAuthService->myBookings($request->user());
        return response()->json(['data' => $bookings]);
    }

    public function myReviews(Request $request)
    {
        $reviews = $this->guestAuthService->myReviews($request->user());
        return response()->json(['data' => $reviews]);
    }
}
