<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BookingConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    public function build()
    {
        return $this->subject('Booking Confirmation - ' . config('app.name'))
                    ->view('emails.booking-confirmation')
                    ->with([
                        'booking' => $this->booking,
                        'guest' => $this->booking->guest,
                        'room' => $this->booking->room,
                    ]);
    }
}
