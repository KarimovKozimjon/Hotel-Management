<?php

use Illuminate\Support\Facades\Route;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\Mail;
use App\Mail\BookingConfirmation;
use App\Mail\CheckInReminder;
use App\Mail\PaymentReceipt;
use App\Mail\BookingCancelled;

// Test email routes (for development only - remove in production)
Route::prefix('test-emails')->group(function () {
    
    Route::get('/booking-confirmation/{bookingId}', function ($bookingId) {
        $booking = Booking::with(['guest', 'room.roomType'])->findOrFail($bookingId);
        return new BookingConfirmation($booking);
    });

    Route::get('/checkin-reminder/{bookingId}', function ($bookingId) {
        $booking = Booking::with(['guest', 'room.roomType'])->findOrFail($bookingId);
        return new CheckInReminder($booking);
    });

    Route::get('/payment-receipt/{paymentId}', function ($paymentId) {
        $payment = Payment::with(['booking.guest', 'booking.room.roomType'])->findOrFail($paymentId);
        return new PaymentReceipt($payment);
    });

    Route::get('/booking-cancelled/{bookingId}', function ($bookingId) {
        $booking = Booking::with(['guest', 'room.roomType'])->findOrFail($bookingId);
        return new BookingCancelled($booking);
    });

    // Send actual test email
    Route::get('/send/{type}/{id}', function ($type, $id) {
        try {
            switch ($type) {
                case 'booking':
                    $booking = Booking::with(['guest', 'room.roomType'])->findOrFail($id);
                    Mail::to($booking->guest->email)->send(new BookingConfirmation($booking));
                    break;
                case 'checkin':
                    $booking = Booking::with(['guest', 'room.roomType'])->findOrFail($id);
                    Mail::to($booking->guest->email)->send(new CheckInReminder($booking));
                    break;
                case 'payment':
                    $payment = Payment::with(['booking.guest', 'booking.room.roomType'])->findOrFail($id);
                    Mail::to($payment->booking->guest->email)->send(new PaymentReceipt($payment));
                    break;
                case 'cancel':
                    $booking = Booking::with(['guest', 'room.roomType'])->findOrFail($id);
                    Mail::to($booking->guest->email)->send(new BookingCancelled($booking));
                    break;
                default:
                    return response()->json(['error' => 'Invalid type'], 400);
            }
            return response()->json(['message' => 'Email sent successfully!']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });
});
