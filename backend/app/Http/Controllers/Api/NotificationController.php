<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller {
    public function index(Request $request) {
        $items = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->get();
        return response()->json($items);
    }

    public function markAsRead(Request $request, $id) {
        $notification = Notification::where('user_id', $request->user()->id)->findOrFail($id);
        $notification->update(['is_read' => true, 'read_at' => now()]);
        return response()->json($notification);
    }

    public function markAllRead(Request $request) {
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);
        return response()->json(['message' => 'All notifications marked as read']);
    }
}
