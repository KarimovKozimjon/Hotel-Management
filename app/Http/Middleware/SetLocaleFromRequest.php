<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocaleFromRequest
{
    /**
     * Set application locale based on request.
     *
     * Supports:
     * - Query param: ?lang=uz|en|ru
     * - Header: Accept-Language: uz / en / ru (or uz-UZ, en-US, etc.)
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $supported = ['en', 'uz', 'ru'];

        $lang = $request->query('lang');
        if (!is_string($lang) || $lang === '') {
            $header = $request->header('Accept-Language', '');
            $lang = is_string($header) ? $header : '';
        }

        $lang = strtolower(trim((string) $lang));

        if ($lang !== '') {
            // Accept-Language can be: "en-US,en;q=0.9,ru;q=0.8"
            $lang = explode(',', $lang)[0] ?? $lang;
            $lang = explode(';', $lang)[0] ?? $lang;
            $lang = explode('-', $lang)[0] ?? $lang;
        }

        if (!in_array($lang, $supported, true)) {
            $lang = config('app.locale', 'en');
        }

        app()->setLocale($lang);

        return $next($request);
    }
}
