<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BookingController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\GuestController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\RoomController;
use App\Http\Controllers\API\RoomTypeController;
use App\Http\Controllers\API\ServiceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/revenue', [DashboardController::class, 'revenue']);

    // Room Types
    Route::apiResource('room-types', RoomTypeController::class);

    // Rooms
    Route::get('/rooms/available', [RoomController::class, 'available']);
    Route::apiResource('rooms', RoomController::class);

    // Guests
    Route::apiResource('guests', GuestController::class);

    // Bookings
    Route::post('/bookings/{booking}/check-in', [BookingController::class, 'checkIn']);
    Route::post('/bookings/{booking}/check-out', [BookingController::class, 'checkOut']);
    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::apiResource('bookings', BookingController::class);

    // Payments
    Route::apiResource('payments', PaymentController::class);

    // Services
    Route::post('/services/add-to-booking', [ServiceController::class, 'addToBooking']);
    Route::apiResource('services', ServiceController::class);
});
