<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Guest;
use App\Models\Payment;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Auth\Access\AuthorizationException;

class InvoiceService
{
    public function bookingInvoiceDownload(int|string $bookingId, mixed $tokenable)
    {
        $booking = Booking::with(['guest', 'room.roomType', 'payments', 'services'])
            ->findOrFail($bookingId);

        $this->authorizeBooking($tokenable, $booking);

        $pdf = Pdf::loadView('invoices.booking-invoice', [
            'booking' => $booking,
            'guest' => $booking->guest,
            'room' => $booking->room,
            'payments' => $booking->payments,
            'services' => $booking->services,
        ]);

        return $pdf->download('invoice-' . $booking->booking_number . '.pdf');
    }

    public function paymentReceiptDownload(int|string $paymentId, mixed $tokenable)
    {
        $payment = Payment::with(['booking.guest', 'booking.room.roomType'])
            ->findOrFail($paymentId);

        $this->authorizePayment($tokenable, $payment);

        $pdf = Pdf::loadView('invoices.payment-receipt', [
            'payment' => $payment,
            'booking' => $payment->booking,
            'guest' => $payment->booking->guest,
        ]);

        return $pdf->download('receipt-' . $payment->id . '.pdf');
    }

    public function bookingInvoiceView(int|string $bookingId, mixed $tokenable)
    {
        $booking = Booking::with(['guest', 'room.roomType', 'payments', 'services'])
            ->findOrFail($bookingId);

        $this->authorizeBooking($tokenable, $booking);

        return view('invoices.booking-invoice', [
            'booking' => $booking,
            'guest' => $booking->guest,
            'room' => $booking->room,
            'payments' => $booking->payments,
            'services' => $booking->services,
        ]);
    }

    public function paymentReceiptView(int|string $paymentId, mixed $tokenable)
    {
        $payment = Payment::with(['booking.guest', 'booking.room.roomType'])
            ->findOrFail($paymentId);

        $this->authorizePayment($tokenable, $payment);

        return view('invoices.payment-receipt', [
            'payment' => $payment,
            'booking' => $payment->booking,
            'guest' => $payment->booking->guest,
        ]);
    }

    /**
     * @throws AuthorizationException
     */
    private function authorizeBooking(mixed $tokenable, Booking $booking): void
    {
        if ($tokenable instanceof User) {
            return;
        }

        if ($tokenable instanceof Guest && (int) $booking->guest_id === (int) $tokenable->id) {
            return;
        }

        throw new AuthorizationException('Forbidden');
    }

    /**
     * @throws AuthorizationException
     */
    private function authorizePayment(mixed $tokenable, Payment $payment): void
    {
        if ($tokenable instanceof User) {
            return;
        }

        if (
            $tokenable instanceof Guest
            && $payment->booking
            && (int) $payment->booking->guest_id === (int) $tokenable->id
        ) {
            return;
        }

        throw new AuthorizationException('Forbidden');
    }
}
