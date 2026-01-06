<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Services\ContactMessageQueryService;
use App\Services\ContactMessageService;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function __construct(
        private readonly ContactMessageQueryService $contactMessageQueryService,
        private readonly ContactMessageService $contactMessageService,
    ) {
    }

    public function index()
    {
        return response()->json($this->contactMessageQueryService->list());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'message' => 'required|string|max:2000'
        ]);

        $this->contactMessageService->create($validated, $request);

        return response()->json([
            'success' => true,
            'message' => 'Xabaringiz qabul qilindi. Tez orada siz bilan bog\'lanamiz!'
        ], 200);
    }

    public function show($id)
    {
        $message = ContactMessage::findOrFail($id);
        $this->contactMessageService->markAsRead($message);
        return response()->json($message);
    }

    public function destroy($id)
    {
        $message = ContactMessage::findOrFail($id);
        $this->contactMessageService->delete($message);
        return response()->json(['message' => 'Xabar o\'chirildi']);
    }

    public function markAsRead($id)
    {
        $message = ContactMessage::findOrFail($id);
        $this->contactMessageService->markAsRead($message);
        return response()->json(['message' => 'Xabar o\'qilgan deb belgilandi']);
    }

    public function getUnreadCount()
    {
        return response()->json(['count' => $this->contactMessageQueryService->unreadCount()]);
    }
}
