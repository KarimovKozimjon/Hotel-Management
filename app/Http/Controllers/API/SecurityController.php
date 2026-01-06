<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BlockedIp;
use App\Models\LoginAttempt;
use Illuminate\Http\Request;

class SecurityController extends Controller
{
    public function loginAttempts(Request $request)
    {
        $validated = $request->validate([
            'guard' => 'nullable|in:staff,guest',
            'email' => 'nullable|string|max:255',
            'ip' => 'nullable|ip',
            'success' => 'nullable|boolean',
            'per_page' => 'nullable|integer|min:1|max:200',
        ]);

        $query = LoginAttempt::query()->latest();

        if (isset($validated['guard'])) {
            $query->where('guard', $validated['guard']);
        }

        if (isset($validated['email'])) {
            $query->where('email', 'like', '%' . $validated['email'] . '%');
        }

        if (isset($validated['ip'])) {
            $query->where('ip', $validated['ip']);
        }

        if (array_key_exists('success', $validated)) {
            $query->where('success', (bool) $validated['success']);
        }

        $perPage = (int) ($validated['per_page'] ?? 50);

        return response()->json($query->paginate($perPage));
    }

    public function blockedIps(Request $request)
    {
        $validated = $request->validate([
            'ip' => 'nullable|ip',
            'active' => 'nullable|boolean',
            'per_page' => 'nullable|integer|min:1|max:200',
        ]);

        $query = BlockedIp::query()->latest();

        if (isset($validated['ip'])) {
            $query->where('ip', $validated['ip']);
        }

        if (array_key_exists('active', $validated)) {
            if ((bool) $validated['active']) {
                $query->where(function ($q) {
                    $q->whereNull('blocked_until')->orWhere('blocked_until', '>', now());
                });
            } else {
                $query->whereNotNull('blocked_until')->where('blocked_until', '<=', now());
            }
        }

        $perPage = (int) ($validated['per_page'] ?? 50);

        return response()->json($query->paginate($perPage));
    }

    public function blockIp(Request $request)
    {
        $validated = $request->validate([
            'ip' => 'required|ip',
            'minutes' => 'nullable|integer|min:1|max:43200',
            'reason' => 'nullable|string|max:255',
        ]);

        $ip = $validated['ip'];
        $minutes = isset($validated['minutes']) ? (int) $validated['minutes'] : 60;

        // Safety: don't let an admin block their own local dev IP by accident.
        if ($ip === '127.0.0.1' || $ip === '::1') {
            return response()->json(['message' => 'Refusing to block localhost.'], 422);
        }

        $blockedUntil = now()->addMinutes($minutes);

        $record = BlockedIp::updateOrCreate(
            ['ip' => $ip],
            [
                'blocked_until' => $blockedUntil,
                'reason' => $validated['reason'] ?? null,
                'created_by_user_id' => $request->user()?->id,
            ]
        );

        return response()->json([
            'message' => 'IP blocked successfully',
            'blocked_ip' => $record,
        ]);
    }

    public function unblockIp(Request $request, string $ip)
    {
        $request->validate([
            'ip' => 'nullable',
        ]);

        $record = BlockedIp::where('ip', $ip)->first();
        if (!$record) {
            return response()->json(['message' => 'IP not found'], 404);
        }

        $record->delete();

        return response()->json(['message' => 'IP unblocked successfully']);
    }
}
