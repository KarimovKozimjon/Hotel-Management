<?php

namespace App\Services;

use App\Models\ContactMessage;
use Illuminate\Support\Collection;

class ContactMessageQueryService
{
    public function list(): Collection
    {
        return ContactMessage::orderBy('created_at', 'desc')->get();
    }

    public function unreadCount(): int
    {
        return ContactMessage::where('is_read', false)->count();
    }
}
