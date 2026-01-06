<?php

namespace App\Services;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ContactMessageService
{
    public function create(array $validated, Request $request): ContactMessage
    {
        $contactMessage = ContactMessage::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'message' => $validated['message'],
            'ip_address' => $request->ip(),
        ]);

        Log::info('Contact form submission', [
            'id' => $contactMessage->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'timestamp' => now(),
        ]);

        return $contactMessage;
    }

    public function markAsRead(ContactMessage $message): void
    {
        $message->markAsRead();
    }

    public function delete(ContactMessage $message): void
    {
        $message->delete();
    }
}
