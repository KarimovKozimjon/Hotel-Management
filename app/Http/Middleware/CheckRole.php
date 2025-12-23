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

        // Check if user's role is in the allowed roles (case-insensitive)
        $allowedRoles = is_array($roles) ? $roles : [$roles];
        $userRole = strtolower($user->role->name);
        $allowedRolesLower = array_map('strtolower', $allowedRoles);
        
        if (!in_array($userRole, $allowedRolesLower)) {
            \Log::warning('Access denied', [
                'user_id' => $user->id,
                'user_role' => $user->role->name,
                'required_roles' => $allowedRoles,
                'url' => $request->url(),
                'method' => $request->method()
            ]);
            return response()->json(['error' => 'Forbidden - Insufficient permissions'], 403);
        }

        return $next($request);
    }
}
