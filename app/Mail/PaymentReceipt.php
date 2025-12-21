<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaymentReceipt extends Mailable
{
    use Queueable, SerializesModels;

    public $payment;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    public function build()
    {
        return $this->subject('Payment Receipt - ' . config('app.name'))
                    ->view('emails.payment-receipt')
                    ->with([
                        'payment' => $this->payment,
                        'booking' => $this->payment->booking,
                        'guest' => $this->payment->booking->guest,
                    ]);
    }
}
