<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Announcement;
use App\Models\AnnouncementRead;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NotificationController extends Controller {
    public function index(Request $request) {
        $user = $request->user();
        if ($user) {
            $this->syncAnnouncementNotifications($user);
        }

        $items = Notification::where('user_id', $user->id)
            ->latest()
            ->take(30)
            ->get();

        $unreadCount = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'data' => $items,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markAsRead(Request $request, $id) {
        $user = $request->user();
        $notification = Notification::where('user_id', $user->id)->findOrFail($id);
        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        $announcementId = $notification->data['announcement_id'] ?? null;
        if ($announcementId) {
            AnnouncementRead::firstOrCreate([
                'announcement_id' => $announcementId,
                'user_id' => $user->id,
            ], [
                'read_at' => now(),
            ]);
        }

        return response()->json($notification);
    }

    public function markAllRead(Request $request) {
        $user = $request->user();
        Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        $role = strtolower(trim((string)$user->role));
        $audiences = ['all', $role];
        if (in_array($role, ['teacher', 'faculty'])) {
            $audiences = array_unique(array_merge($audiences, ['teacher', 'teachers', 'faculty']));
        } elseif (in_array($role, ['student'])) {
            $audiences = array_unique(array_merge($audiences, ['student', 'students']));
        } elseif (in_array($role, ['admin', 'administrator'])) {
            $audiences = ['all', 'students', 'teachers', 'teacher', 'faculty', 'admin'];
        }

        $visibleAnnouncements = Announcement::where('is_published', true)
            ->whereIn('target_audience', $audiences)
            ->pluck('id');

        foreach ($visibleAnnouncements as $annId) {
            AnnouncementRead::firstOrCreate([
                'announcement_id' => $annId,
                'user_id' => $user->id,
            ], [
                'read_at' => now(),
            ]);
        }

        return response()->json(['message' => 'All notifications marked as read']);
    }

    protected function syncAnnouncementNotifications($user) {
        $role = strtolower(trim((string)$user->role));
        $audiences = ['all', $role];
        if (in_array($role, ['teacher', 'faculty'])) {
            $audiences = array_unique(array_merge($audiences, ['teacher', 'teachers', 'faculty']));
        } elseif (in_array($role, ['student'])) {
            $audiences = array_unique(array_merge($audiences, ['student', 'students']));
        } elseif (in_array($role, ['admin', 'administrator'])) {
            $audiences = ['all', 'students', 'teachers', 'teacher', 'faculty', 'admin'];
        }

        $publishedAnnouncements = Announcement::where('is_published', true)
            ->whereIn('target_audience', $audiences)
            ->get();

        $activeAnnouncementIds = $publishedAnnouncements->pluck('id')->all();

        // Clean up orphaned announcement notifications
        $userNotifs = Notification::where('user_id', $user->id)
            ->where('type', 'announcement')
            ->get();

        foreach ($userNotifs as $notif) {
            $data = is_array($notif->data) ? $notif->data : (json_decode((string)$notif->data, true) ?: []);
            $annId = $data['announcement_id'] ?? null;
            if ($annId && !in_array((int)$annId, $activeAnnouncementIds)) {
                $notif->delete();
            }
        }

        // Get read announcement records for this user
        $readAnnouncementIds = AnnouncementRead::where('user_id', $user->id)
            ->pluck('read_at', 'announcement_id')
            ->all();

        foreach ($publishedAnnouncements as $ann) {
            $isRead = isset($readAnnouncementIds[$ann->id]);
            $readAt = $isRead ? $readAnnouncementIds[$ann->id] : null;

            $existing = Notification::where('user_id', $user->id)
                ->where('type', 'announcement')
                ->whereRaw("(\"data\"->>'announcement_id') = ?", [(string)$ann->id])
                ->first();

            $contentPreview = Str::limit($ann->content, 180);
            $annDbTimestamp = $ann->published_at ?? $ann->created_at ?? now();
            $annTimestampIso = $ann->published_at 
                ? (method_exists($ann->published_at, 'toIso8601String') ? $ann->published_at->toIso8601String() : (string)$ann->published_at)
                : ($ann->created_at 
                    ? (method_exists($ann->created_at, 'toIso8601String') ? $ann->created_at->toIso8601String() : (string)$ann->created_at) 
                    : now()->toIso8601String());

            if (!$existing) {
                Notification::create([
                    'user_id' => $user->id,
                    'title' => $ann->title,
                    'message' => $contentPreview,
                    'type' => 'announcement',
                    'is_read' => $isRead,
                    'read_at' => $readAt,
                    'data' => [
                        'announcement_id' => $ann->id,
                        'target_audience' => $ann->target_audience,
                        'published_at' => $ann->published_at ? $ann->published_at->toIso8601String() : null,
                        'announcement_timestamp' => $annTimestampIso,
                    ],
                    'created_at' => $annDbTimestamp,
                ]);
            } else {
                $updates = [];
                if ($existing->title !== $ann->title) {
                    $updates['title'] = $ann->title;
                }
                if ($existing->message !== $contentPreview) {
                    $updates['message'] = $contentPreview;
                }
                if ($isRead && !$existing->is_read) {
                    $updates['is_read'] = true;
                    $updates['read_at'] = $readAt ?? now();
                }
                if ($existing->created_at != $annDbTimestamp) {
                    $updates['created_at'] = $annDbTimestamp;
                }
                
                $data = $existing->data ?? [];
                if (($data['announcement_timestamp'] ?? null) !== $annTimestampIso) {
                    $data['announcement_id'] = $ann->id;
                    $data['target_audience'] = $ann->target_audience;
                    $data['published_at'] = $ann->published_at ? $ann->published_at->toISOString() : null;
                    $data['announcement_timestamp'] = $annTimestampIso;
                    $updates['data'] = $data;
                }

                if (!empty($updates)) {
                    $existing->update($updates);
                }
            }
        }
    }
}
