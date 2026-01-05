<?php

namespace App\Notifications;

use App\Models\Review;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewReviewSubmitted extends Notification
{
    use Queueable;

    public function __construct(private readonly Review $review)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $guestName = $this->review->guest?->full_name
            ?? $this->review->guest?->getName()
            ?? 'Guest';

        $bookingId = $this->review->booking_id;
        $rating = $this->review->rating;

        $message = "New review: {$guestName} rated {$rating}/5";
        $description = "Booking #{$bookingId}";

        return [
            'type' => 'review',
            'message' => $message,
            'description' => $description,
            'review_id' => $this->review->id,
            'booking_id' => $bookingId,
            'guest_id' => $this->review->guest_id,
            'rating' => $rating,
        ];
    }
}
