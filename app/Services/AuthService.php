<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(
        private readonly LoginAuditService $loginAuditService,
        private readonly TwoFactorService $twoFactorService,
    )
    {
    }

    public function register(array $validated): array
    {
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'] ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return ['user' => $user->load('role'), 'token' => $token];
    }

    /**
     * @throws ValidationException
     */
    public function login(
        string $email,
        string $password,
        ?string $twoFactorCode = null,
        ?string $ip = null,
        ?string $userAgent = null
    ): array
    {
        \Log::info('Login attempt', [
            'email' => $email,
        ]);

        if (!Auth::attempt(['email' => $email, 'password' => $password])) {
            $this->loginAuditService->record('staff', $email, null, $ip, $userAgent, false, 'invalid_credentials');

            \Log::warning('Login failed - invalid credentials', [
                'email' => $email,
                'user_exists' => User::where('email', $email)->exists(),
            ]);

            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = User::where('email', $email)->firstOrFail();

        $user->load('role');
        $roleName = strtolower((string) ($user->role?->name ?? ''));
        $isAdmin = $roleName === 'admin';

        if ($isAdmin && $user->two_factor_enabled_at) {
            $secret = $this->twoFactorService->decryptSecret($user->two_factor_secret);

            if (!$twoFactorCode) {
                $this->loginAuditService->record('staff', $email, $user, $ip, $userAgent, false, 'two_factor_required');
                throw ValidationException::withMessages([
                    'two_factor_code' => ['Two-factor code is required.'],
                ]);
            }

            if (!$secret || !$this->twoFactorService->verifyCode($secret, $twoFactorCode)) {
                $this->loginAuditService->record('staff', $email, $user, $ip, $userAgent, false, 'invalid_two_factor_code');
                throw ValidationException::withMessages([
                    'two_factor_code' => ['Invalid two-factor code.'],
                ]);
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $this->loginAuditService->record('staff', $email, $user, $ip, $userAgent, true);

        \Log::info('Login successful', ['user_id' => $user->id]);

        return ['user' => $user, 'token' => $token];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }

    public function me(User $user): User
    {
        return $user->load('role');
    }
}
