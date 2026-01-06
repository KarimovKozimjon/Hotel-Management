<?php

namespace App\Services;

use App\Models\Guest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Collection;

class GuestAuthService
{
    public function __construct(private readonly LoginAuditService $loginAuditService)
    {
    }

    public function register(array $validated): array
    {
        $guest = Guest::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'],
            'passport_number' => $validated['passport_number'],
            'date_of_birth' => $validated['date_of_birth'],
            'nationality' => $validated['nationality'],
            'address' => $validated['address'] ?? null,
        ]);

        $token = $guest->createToken('guest-token')->plainTextToken;

        return ['guest' => $guest, 'token' => $token];
    }

    public function login(string $email, string $password, ?string $ip = null, ?string $userAgent = null): array
    {
        $guest = Guest::where('email', $email)->first();

        if (!$guest || !Hash::check($password, $guest->password)) {
            $this->loginAuditService->record('guest', $email, null, $ip, $userAgent, false, 'invalid_credentials');
            return ['guest' => null, 'token' => null];
        }

        $token = $guest->createToken('guest-token')->plainTextToken;

        $this->loginAuditService->record('guest', $email, $guest, $ip, $userAgent, true);

        return ['guest' => $guest, 'token' => $token];
    }

    public function logout(Guest $guest): void
    {
        $guest->currentAccessToken()?->delete();
    }

    public function updateProfile(Guest $guest, array $validated): Guest
    {
        $guest->update($validated);
        return $guest;
    }

    public function myBookings(Guest $guest): Collection
    {
        return $guest->bookings()
            ->with(['room.roomType', 'payments', 'services', 'reviews'])
            ->latest()
            ->get();
    }

    public function myReviews(Guest $guest): Collection
    {
        return $guest->reviews()
            ->with(['booking.room'])
            ->latest()
            ->get();
    }
}
