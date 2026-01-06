<?php

namespace App\Services;

use App\Models\BlockedIp;
use App\Models\LoginAttempt;
use Illuminate\Support\Facades\Log;

class LoginAuditService
{
    private const AUTO_BLOCK_WINDOW_MINUTES = 30;
    private const AUTO_BLOCK_THRESHOLD = 25;
    private const AUTO_BLOCK_MINUTES = 60;

    public function record(
        string $guard,
        ?string $email,
        mixed $tokenable,
        ?string $ip,
        ?string $userAgent,
        bool $success,
        ?string $reason = null,
    ): void {
        try {
            LoginAttempt::create([
                'guard' => $guard,
                'email' => $email,
                'tokenable_type' => $tokenable ? get_class($tokenable) : null,
                'tokenable_id' => $tokenable?->id,
                'ip' => $ip,
                'user_agent' => $userAgent,
                'success' => $success,
                'reason' => $reason,
            ]);

            $this->maybeAutoBlockIp($ip, $success, $reason);
        } catch (\Throwable $e) {
            // Never break login flow because of audit write
            Log::warning('Login audit write failed', [
                'guard' => $guard,
                'email' => $email,
                'success' => $success,
                'reason' => $reason,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function maybeAutoBlockIp(?string $ip, bool $success, ?string $reason): void
    {
        if (!$ip) {
            return;
        }

        // Never auto-block local dev.
        if ($ip === '127.0.0.1' || $ip === '::1') {
            return;
        }

        if ($success) {
            return;
        }

        // Only count credential-related failures.
        $blockReasons = [
            'invalid_credentials',
            'invalid_two_factor_code',
        ];

        if ($reason && !in_array($reason, $blockReasons, true)) {
            return;
        }

        $activeBlock = BlockedIp::where('ip', $ip)
            ->where(function ($q) {
                $q->whereNull('blocked_until')->orWhere('blocked_until', '>', now());
            })
            ->first();

        if ($activeBlock) {
            return;
        }

        $windowStart = now()->subMinutes(self::AUTO_BLOCK_WINDOW_MINUTES);

        $recentFails = LoginAttempt::query()
            ->where('ip', $ip)
            ->where('success', false)
            ->where('created_at', '>=', $windowStart)
            ->count();

        if ($recentFails < self::AUTO_BLOCK_THRESHOLD) {
            return;
        }

        BlockedIp::updateOrCreate(
            ['ip' => $ip],
            [
                'blocked_until' => now()->addMinutes(self::AUTO_BLOCK_MINUTES),
                'reason' => 'auto_block_failed_logins',
                'created_by_user_id' => null,
            ]
        );
    }
}
