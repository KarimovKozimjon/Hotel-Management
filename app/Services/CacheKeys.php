<?php

namespace App\Services;

final class CacheKeys
{
    public const PUBLIC_ROOM_TYPES = 'public:room-types:v1';
    public const ROOM_TYPES_INDEX = 'room-types:index:v1';
    public const PUBLIC_AVAILABLE_ROOMS = 'public:rooms:available:v1';
    public const DASHBOARD_INDEX = 'dashboard:index:v1';

    public static function dashboardRevenue(string $period, string $date): string
    {
        return sprintf('dashboard:revenue:v1:%s:%s', $period, $date);
    }

    public static function notificationsForUser(int|string $userId): string
    {
        return sprintf('notifications:user:%s', $userId);
    }
}
