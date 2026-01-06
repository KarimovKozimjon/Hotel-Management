<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ((bool) env('FORCE_HTTPS', false)) {
            URL::forceScheme('https');
        }

        RateLimiter::for('login', function (Request $request) {
            $email = (string) $request->input('email', '');
            $key = 'login|' . $request->ip() . '|' . mb_strtolower($email);

            return [
                Limit::perMinute(5)->by($key),
                Limit::perHour(30)->by($key),
            ];
        });

        RateLimiter::for('guest-login', function (Request $request) {
            $email = (string) $request->input('email', '');
            $key = 'guest-login|' . $request->ip() . '|' . mb_strtolower($email);

            return [
                Limit::perMinute(5)->by($key),
                Limit::perHour(30)->by($key),
            ];
        });

        RateLimiter::for('register', function (Request $request) {
            return [
                Limit::perMinute(3)->by('register|' . $request->ip()),
                Limit::perHour(20)->by('register|' . $request->ip()),
            ];
        });
    }
}
