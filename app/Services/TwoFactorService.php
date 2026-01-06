<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorService
{
    private Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    public function generateSecret(): string
    {
        return $this->google2fa->generateSecretKey(32);
    }

    public function encryptSecret(string $secret): string
    {
        return Crypt::encryptString($secret);
    }

    public function decryptSecret(?string $encryptedSecret): ?string
    {
        if (!$encryptedSecret) {
            return null;
        }

        return Crypt::decryptString($encryptedSecret);
    }

    public function getOtpAuthUrl(string $issuer, string $label, string $secret): string
    {
        $issuerEnc = rawurlencode($issuer);
        $labelEnc = rawurlencode($label);
        $secretEnc = rawurlencode($secret);

        return "otpauth://totp/{$issuerEnc}:{$labelEnc}?secret={$secretEnc}&issuer={$issuerEnc}";
    }

    public function verifyCode(string $secret, string $code): bool
    {
        $normalized = preg_replace('/\s+/', '', (string) $code);
        if ($normalized === '') {
            return false;
        }

        return (bool) $this->google2fa->verifyKey($secret, $normalized, 2);
    }
}
