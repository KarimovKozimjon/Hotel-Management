<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function generateBookingInvoice($bookingId)
    {
        try {
            $booking = Booking::with(['guest', 'room.roomType', 'payments', 'services'])
                ->findOrFail($bookingId);

            $pdf = Pdf::loadView('invoices.booking-invoice', [
                'booking' => $booking,
                'guest' => $booking->guest,
                'room' => $booking->room,
                'payments' => $booking->payments,
                'services' => $booking->services,
            ]);

            return $pdf->download('invoice-' . $booking->booking_number . '.pdf');
        } catch (\Throwable $e) {
            \Log::error('Invoice PDF generation error: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json([
                'error' => 'Invoice generation failed',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function generatePaymentReceipt($paymentId)
    {
        $payment = Payment::with(['booking.guest', 'booking.room.roomType'])
            ->findOrFail($paymentId);

        $pdf = Pdf::loadView('invoices.payment-receipt', [
            'payment' => $payment,
            'booking' => $payment->booking,
            'guest' => $payment->booking->guest,
        ]);

        return $pdf->download('receipt-' . $payment->id . '.pdf');
    }

    public function previewBookingInvoice($bookingId)
    {
        $booking = Booking::with(['guest', 'room.roomType', 'payments', 'services'])
            ->findOrFail($bookingId);

        return view('invoices.booking-invoice', [
            'booking' => $booking,
            'guest' => $booking->guest,
            'room' => $booking->room,
            'payments' => $booking->payments,
            'services' => $booking->services,
        ]);
    }

    public function previewPaymentReceipt($paymentId)
    {
        $payment = Payment::with(['booking.guest', 'booking.room.roomType'])
            ->findOrFail($paymentId);

        return view('invoices.payment-receipt', [
            'payment' => $payment,
            'booking' => $payment->booking,
            'guest' => $payment->booking->guest,
        ]);
    }
}
