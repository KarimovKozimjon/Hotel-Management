<?php

namespace App\Http\Middleware;

use App\Models\BlockedIp;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIpNotBlocked
{
    /**
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $ip = $request->ip();

        // Never block local dev access.
        if ($ip === '127.0.0.1' || $ip === '::1') {
            return $next($request);
        }

        $blocked = BlockedIp::where('ip', $ip)->first();
        if (!$blocked) {
            return $next($request);
        }

        if ($blocked->blocked_until && $blocked->blocked_until->isPast()) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Your IP is temporarily blocked.',
        ], 403);
    }
}
