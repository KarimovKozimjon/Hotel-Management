<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Review;
use App\Models\User;
use App\Notifications\NewReviewSubmitted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class ReviewService
{
    /**
     * @return array{review: Review|null, error: string|null, status: int}
     */
    public function create(array $validated): array
    {
        $result = DB::transaction(function () use ($validated) {
            $booking = Booking::where('id', $validated['booking_id'])
                ->where('guest_id', $validated['guest_id'])
                ->lockForUpdate()
                ->first();

            if (!$booking) {
                return ['review' => null, 'error' => 'Booking does not belong to this guest', 'status' => 400];
            }

            if ($booking->status !== 'checked_out') {
                return ['review' => null, 'error' => 'Can only review completed bookings', 'status' => 400];
            }

            $existingReview = Review::where('booking_id', $validated['booking_id'])->lockForUpdate()->first();
            if ($existingReview) {
                return ['review' => null, 'error' => 'Review already exists for this booking', 'status' => 400];
            }

            $review = Review::create($validated);
            $review->load(['booking.room', 'guest']);

            return ['review' => $review, 'error' => null, 'status' => 201];
        });

        if ($result['error']) {
            return $result;
        }

        /** @var Review $review */
        $review = $result['review'];

        $admins = User::whereHas('role', function ($q) {
            $q->where('name', 'admin');
        })->get();

        if ($admins->isNotEmpty()) {
            Notification::send($admins, new NewReviewSubmitted($review));
        }

        return ['review' => $review, 'error' => null, 'status' => 201];
    }

    public function update(Review $review, array $validated): Review
    {
        $review->update($validated);
        return $review->load(['booking.room', 'guest']);
    }

    public function delete(Review $review): void
    {
        $review->delete();
    }
}
