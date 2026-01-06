<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Services\ReviewQueryService;
use App\Services\ReviewService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    public function __construct(
        private readonly ReviewQueryService $reviewQueryService,
        private readonly ReviewService $reviewService,
    ) {
    }

    public function index()
    {
        return response()->json($this->reviewQueryService->list());
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

        $result = $this->reviewService->create($validator->validated());
        if ($result['error']) {
            return response()->json(['error' => $result['error']], $result['status']);
        }

        return response()->json($result['review'], 201);
    }

    public function show($id)
    {
        $review = $this->reviewQueryService->find($id);
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

        return response()->json($this->reviewService->update($review, $validator->validated()));
    }

    public function destroy($id)
    {
        $review = Review::find($id);

        if (!$review) {
            return response()->json(['error' => 'Review not found'], 404);
        }

        $this->reviewService->delete($review);

        return response()->json(['message' => 'Review deleted successfully']);
    }

    public function getByBooking($bookingId)
    {
        $review = $this->reviewQueryService->findByBooking($bookingId);

        if (!$review) {
            return response()->json(['error' => 'Review not found for this booking'], 404);
        }

        return response()->json($review);
    }

    public function getByGuest($guestId)
    {
        $reviews = $this->reviewQueryService->listByGuest($guestId);

        return response()->json($reviews);
    }
}
