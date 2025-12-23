<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    public function index()
    {
        $messages = ContactMessage::orderBy('created_at', 'desc')->get();
        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'message' => 'required|string|max:2000'
        ]);

        // Save to database
        $contactMessage = ContactMessage::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'message' => $validated['message'],
            'ip_address' => $request->ip()
        ]);

        // Log the contact message
        Log::info('Contact form submission', [
            'id' => $contactMessage->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'timestamp' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Xabaringiz qabul qilindi. Tez orada siz bilan bog\'lanamiz!'
        ], 200);
    }

    public function show($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->markAsRead();
        return response()->json($message);
    }

    public function destroy($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();
        return response()->json(['message' => 'Xabar o\'chirildi']);
    }

    public function markAsRead($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->markAsRead();
        return response()->json(['message' => 'Xabar o\'qilgan deb belgilandi']);
    }

    public function getUnreadCount()
    {
        $count = ContactMessage::where('is_read', false)->count();
        return response()->json(['count' => $count]);
    }
}
