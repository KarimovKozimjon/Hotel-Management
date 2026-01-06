<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\Services\TwoFactorService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly TwoFactorService $twoFactorService,
    )
    {
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => 'nullable|exists:roles,id',
        ]);

        $payload = $this->authService->register($validated);

        return response()->json($payload, 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'two_factor_code' => 'nullable|string',
        ]);

        try {
            $payload = $this->authService->login(
                $request->email,
                $request->password,
                $request->input('two_factor_code'),
                $request->ip(),
                $request->userAgent()
            );
        } catch (ValidationException $e) {
            throw $e;
        }

        return response()->json($payload);
    }

    public function logout(Request $request)
    {
        $this->authService->logout($request->user());

        return response()->json(['message' => 'Successfully logged out']);
    }

    public function me(Request $request)
    {
        return response()->json($this->authService->me($request->user()));
    }

    public function twoFactorSetup(Request $request)
    {
        $user = $request->user();

        $secret = $this->twoFactorService->generateSecret();

        $user->forceFill([
            'two_factor_secret' => $this->twoFactorService->encryptSecret($secret),
            'two_factor_enabled_at' => null,
        ])->save();

        $issuer = (string) config('app.name', 'Hotel');
        $label = (string) $user->email;

        return response()->json([
            'secret' => $secret,
            'otpauth_url' => $this->twoFactorService->getOtpAuthUrl($issuer, $label, $secret),
            'message' => 'Two-factor setup created. Verify to enable.',
        ]);
    }

    public function twoFactorEnable(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
        ]);

        $user = $request->user();
        $secret = $this->twoFactorService->decryptSecret($user->two_factor_secret);

        if (!$secret) {
            return response()->json(['message' => 'Two-factor is not set up.'], 422);
        }

        if (!$this->twoFactorService->verifyCode($secret, $validated['code'])) {
            return response()->json(['message' => 'Invalid two-factor code.'], 422);
        }

        $user->forceFill([
            'two_factor_enabled_at' => now(),
        ])->save();

        return response()->json(['message' => 'Two-factor enabled successfully.']);
    }

    public function twoFactorDisable(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
        ]);

        $user = $request->user();
        $secret = $this->twoFactorService->decryptSecret($user->two_factor_secret);

        if (!$secret) {
            return response()->json(['message' => 'Two-factor is not enabled.'], 422);
        }

        if (!$this->twoFactorService->verifyCode($secret, $validated['code'])) {
            return response()->json(['message' => 'Invalid two-factor code.'], 422);
        }

        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_enabled_at' => null,
        ])->save();

        return response()->json(['message' => 'Two-factor disabled successfully.']);
    }
}
