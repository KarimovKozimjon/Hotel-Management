<?php

namespace App\Http\Middleware;

use App\Models\Guest;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSanctumGuest
{
    /**
     * Ensure the current Sanctum token belongs to a Guest.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tokenable = $request->user();

        if (!$tokenable) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (!$tokenable instanceof Guest) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}
