<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class NotificationService
{
    public function listForUser(User $user): Collection
    {
        $cacheKey = CacheKeys::notificationsForUser($user->id);

        return Cache::remember($cacheKey, now()->addSeconds(10), function () use ($user) {
            return $user->notifications()
                ->select(['id', 'data', 'read_at', 'created_at'])
                ->latest('created_at')
                ->limit(50)
                ->get()
                ->map(function ($notification) {
                    $data = is_array($notification->data) ? $notification->data : [];

                    return [
                        'id' => $notification->id,
                        'type' => $data['type'] ?? 'info',
                        'message' => $data['message'] ?? ($data['title'] ?? 'Notification'),
                        'description' => $data['description'] ?? null,
                        'read' => (bool) $notification->read_at,
                        'timestamp' => $notification->created_at?->toISOString(),
                        'data' => $data,
                    ];
                })
                ->values();
        });
    }

    public function invalidateForUser(User $user): void
    {
        Cache::forget(CacheKeys::notificationsForUser($user->id));
    }

    public function markAsRead(User $user, string $id): bool
    {
        $this->invalidateForUser($user);

        $notification = $user->notifications()->where('id', $id)->first();
        if (!$notification) {
            return false;
        }

        $notification->markAsRead();
        return true;
    }

    public function markAllAsRead(User $user): void
    {
        $this->invalidateForUser($user);
        $user->unreadNotifications->markAsRead();
    }

    public function delete(User $user, string $id): bool
    {
        $this->invalidateForUser($user);

        $notification = $user->notifications()->where('id', $id)->first();
        if (!$notification) {
            return false;
        }

        $notification->delete();
        return true;
    }
}
