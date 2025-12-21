<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // If user doesn't have a role
        if (!$user->role) {
            return response()->json(['error' => 'User has no role assigned'], 403);
        }

        // Check if user's role is in the allowed roles
        $allowedRoles = is_array($roles) ? $roles : [$roles];
        
        if (!in_array($user->role->name, $allowedRoles)) {
            return response()->json(['error' => 'Forbidden - Insufficient permissions'], 403);
        }

        return $next($request);
    }
}
