<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Load test email routes (only in development)
if (app()->environment('local')) {
    require __DIR__ . '/test-emails.php';
}
