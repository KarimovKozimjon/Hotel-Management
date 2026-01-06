<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        // Basic hardening headers (safe defaults)
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'same-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // HSTS only when HTTPS is enforced
        if ((bool) env('FORCE_HTTPS', false) && (bool) env('HSTS_ENABLED', true)) {
            $maxAge = (int) env('HSTS_MAX_AGE', 15552000); // 180 days
            $includeSubDomains = (bool) env('HSTS_INCLUDE_SUBDOMAINS', true);
            $preload = (bool) env('HSTS_PRELOAD', false);

            $hsts = 'max-age=' . $maxAge;
            if ($includeSubDomains) {
                $hsts .= '; includeSubDomains';
            }
            if ($preload) {
                $hsts .= '; preload';
            }

            $response->headers->set('Strict-Transport-Security', $hsts);
        }

        return $response;
    }
}
