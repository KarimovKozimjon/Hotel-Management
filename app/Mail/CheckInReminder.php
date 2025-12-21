<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CheckInReminder extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    public function build()
    {
        return $this->subject('Check-in Reminder - ' . config('app.name'))
                    ->view('emails.checkin-reminder')
                    ->with([
                        'booking' => $this->booking,
                        'guest' => $this->booking->guest,
                        'room' => $this->booking->room,
                    ]);
    }
}
