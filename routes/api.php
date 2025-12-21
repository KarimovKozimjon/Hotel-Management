<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BookingController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\GuestController;
use App\Http\Controllers\API\GuestAuthController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\RoomController;
use App\Http\Controllers\API\RoomTypeController;
use App\Http\Controllers\API\ServiceController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\RoleController;
use App\Http\Controllers\API\ReviewController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes - Staff Login
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public routes - Guest Portal
Route::post('/guest/register', [GuestAuthController::class, 'register']);
Route::post('/guest/login', [GuestAuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard - All authenticated users
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/revenue', [DashboardController::class, 'revenue']);

    // Room Types - Admin and Manager
    Route::middleware('role:Admin,Manager')->group(function () {
        Route::apiResource('room-types', RoomTypeController::class)->except(['index', 'show']);
    });
    Route::get('/room-types', [RoomTypeController::class, 'index']);
    Route::get('/room-types/{id}', [RoomTypeController::class, 'show']);

    // Rooms - Admin and Manager can modify, all can view
    Route::middleware('role:Admin,Manager')->group(function () {
        Route::post('/rooms', [RoomController::class, 'store']);
        Route::put('/rooms/{id}', [RoomController::class, 'update']);
        Route::delete('/rooms/{id}', [RoomController::class, 'destroy']);
    });
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/rooms/available', [RoomController::class, 'available']);
    Route::get('/rooms/{id}', [RoomController::class, 'show']);

    // Guests - All can view and create, Admin/Manager can modify
    Route::get('/guests', [GuestController::class, 'index']);
    Route::get('/guests/{id}', [GuestController::class, 'show']);
    Route::post('/guests', [GuestController::class, 'store']);
    Route::middleware('role:Admin,Manager')->group(function () {
        Route::put('/guests/{id}', [GuestController::class, 'update']);
        Route::delete('/guests/{id}', [GuestController::class, 'destroy']);
    });

    // Bookings - All authenticated users
    Route::post('/bookings/{booking}/check-in', [BookingController::class, 'checkIn']);
    Route::post('/bookings/{booking}/check-out', [BookingController::class, 'checkOut']);
    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::apiResource('bookings', BookingController::class);

    // Payments - All authenticated users
    Route::apiResource('payments', PaymentController::class);

    // Services - Admin and Manager can modify, all can view
    Route::middleware('role:Admin,Manager')->group(function () {
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{id}', [ServiceController::class, 'update']);
        Route::delete('/services/{id}', [ServiceController::class, 'destroy']);
    });
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{id}', [ServiceController::class, 'show']);
    Route::post('/services/add-to-booking', [ServiceController::class, 'addToBooking']);

    // Reviews - All authenticated users
    Route::get('/reviews/booking/{bookingId}', [ReviewController::class, 'getByBooking']);
    Route::get('/reviews/guest/{guestId}', [ReviewController::class, 'getByGuest']);
    Route::apiResource('reviews', ReviewController::class);

    // Users - Temporarily accessible to all for testing (should be Admin only in production)
    Route::apiResource('users', UserController::class);

    // Roles - Temporarily accessible to all for testing (should be Admin only in production)
    Route::apiResource('roles', RoleController::class);
});

// Guest Portal Routes (separate auth guard)
Route::prefix('guest')->middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [GuestAuthController::class, 'logout']);
    Route::get('/me', [GuestAuthController::class, 'me']);
    
    // Guest's own bookings and reviews
    Route::get('/my-bookings', [GuestAuthController::class, 'myBookings']);
    Route::get('/my-reviews', [GuestAuthController::class, 'myReviews']);
});
