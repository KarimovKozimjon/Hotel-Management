<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSanctumUser
{
    /**
     * Ensure the current Sanctum token belongs to a User (staff).
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tokenable = $request->user();

        if (!$tokenable) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (!$tokenable instanceof User) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}
