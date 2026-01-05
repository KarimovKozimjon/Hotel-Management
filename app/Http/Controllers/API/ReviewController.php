<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Booking;
use App\Models\User;
use App\Notifications\NewReviewSubmitted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    public function index()
    {
        $reviews = Review::with(['booking.room', 'guest'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reviews);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'booking_id' => 'required|exists:bookings,id',
            'guest_id' => 'required|exists:guests,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if booking belongs to the guest
        $booking = Booking::where('id', $request->booking_id)
            ->where('guest_id', $request->guest_id)
            ->first();

        if (!$booking) {
            return response()->json(['error' => 'Booking does not belong to this guest'], 400);
        }

        // Check if booking is completed
        if ($booking->status !== 'checked_out') {
            return response()->json(['error' => 'Can only review completed bookings'], 400);
        }

        // Check if review already exists
        $existingReview = Review::where('booking_id', $request->booking_id)->first();
        if ($existingReview) {
            return response()->json(['error' => 'Review already exists for this booking'], 400);
        }

        $review = Review::create($request->all());
        $review->load(['booking.room', 'guest']);

        $admins = User::whereHas('role', function ($q) {
            $q->where('name', 'admin');
        })->get();

        if ($admins->isNotEmpty()) {
            Notification::send($admins, new NewReviewSubmitted($review));
        }

        return response()->json($review, 201);
    }

    public function show($id)
    {
        $review = Review::with(['booking.room', 'guest'])->find($id);

        if (!$review) {
            return response()->json(['error' => 'Review not found'], 404);
        }

        return response()->json($review);
    }

    public function update(Request $request, $id)
    {
        $review = Review::find($id);

        if (!$review) {
            return response()->json(['error' => 'Review not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'sometimes|required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $review->update($request->all());
        $review->load(['booking.room', 'guest']);

        return response()->json($review);
    }

    public function destroy($id)
    {
        $review = Review::find($id);

        if (!$review) {
            return response()->json(['error' => 'Review not found'], 404);
        }

        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }

    public function getByBooking($bookingId)
    {
        $review = Review::with(['booking.room', 'guest'])
            ->where('booking_id', $bookingId)
            ->first();

        if (!$review) {
            return response()->json(['error' => 'Review not found for this booking'], 404);
        }

        return response()->json($review);
    }

    public function getByGuest($guestId)
    {
        $reviews = Review::with(['booking.room', 'guest'])
            ->where('guest_id', $guestId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reviews);
    }
}
