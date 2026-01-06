<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(private readonly NotificationService $notificationService)
    {
    }

    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $notifications = $this->notificationService->listForUser($user);

        return response()->json(['data' => $notifications]);
    }

    public function markAsRead(Request $request, string $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $ok = $this->notificationService->markAsRead($user, $id);
        if (!$ok) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        return response()->json(['message' => 'OK']);
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $this->notificationService->markAllAsRead($user);

        return response()->json(['message' => 'OK']);
    }

    public function destroy(Request $request, string $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $ok = $this->notificationService->delete($user, $id);
        if (!$ok) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        return response()->json(['message' => 'Deleted']);
    }
}
