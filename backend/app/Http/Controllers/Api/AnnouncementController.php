<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AnnouncementService;
use Illuminate\Http\Request;
use App\Models\Announcement;
use App\Models\AnnouncementRead;

class AnnouncementController extends Controller
{
    protected $announcementService;

    public function __construct(AnnouncementService $announcementService)
    {
        $this->announcementService = $announcementService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        if ($user && $user->isAdmin()) {
            return response()->json(Announcement::with('author')->latest('published_at')->latest('created_at')->get());
        }
        
        $role = strtolower(trim((string)($user ? $user->role : '')));
        $audiences = ['all', $role];
        if (in_array($role, ['teacher', 'faculty'])) {
            $audiences = array_unique(array_merge($audiences, ['teacher', 'teachers', 'faculty']));
        } elseif (in_array($role, ['student'])) {
            $audiences = array_unique(array_merge($audiences, ['student', 'students']));
        }

        $announcements = Announcement::where('is_published', true)
            ->whereIn('target_audience', $audiences)
            ->with('author')
            ->latest('published_at')
            ->latest('created_at')
            ->get();

        if ($user) {
            $readIds = AnnouncementRead::where('user_id', $user->id)
                ->pluck('announcement_id')
                ->flip()
                ->all();

            $announcements->transform(function ($ann) use ($readIds) {
                $isRead = isset($readIds[$ann->id]);
                $ann->is_read = $isRead;
                $ann->isRead = $isRead;
                return $ann;
            });
        }

        return response()->json($announcements);
    }

    public function teacherIndex(Request $request)
    {
        return $this->index($request);
    }

    public function show($id)
    {
        $announcement = Announcement::with('author')->findOrFail($id);
        return response()->json($announcement);
    }

    public function store(Request $request)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'target_audience' => 'nullable|in:all,students,teachers,admin',
        ]);
        
        $announcement = Announcement::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'target_audience' => $validated['target_audience'] ?? 'all',
            'author_id' => $request->user()->id,
            'is_published' => true,
            'published_at' => now(),
        ]);

        $this->dispatchAnnouncementNotifications($announcement);

        return response()->json($announcement->load('author'), 201);
    }

    public function update(Request $request, $id)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        $announcement = Announcement::findOrFail($id);
        $announcement->update($request->only(['title', 'content', 'target_audience', 'is_published']));
        
        $this->dispatchAnnouncementNotifications($announcement);

        return response()->json($announcement->load('author'));
    }

    public function destroy(Request $request, $id)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        $announcement = Announcement::findOrFail($id);
        
        try {
            Notification::where('type', 'announcement')
                ->whereRaw("(\"data\"->>'announcement_id') = ?", [(string)$id])
                ->delete();
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Error cleaning up notifications on announcement delete: ' . $e->getMessage());
        }

        $announcement->delete();
        return response()->json(['message' => 'Announcement deleted successfully']);
    }

    public function markAsRead(Request $request, $id)
    {
        $userId = $request->user()->id;
        AnnouncementRead::firstOrCreate([
            'announcement_id' => $id,
            'user_id' => $userId,
        ], [
            'read_at' => now(),
        ]);

        try {
            Notification::where('user_id', $userId)
                ->whereRaw("(\"data\"->>'announcement_id') = ?", [(string)$id])
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Error updating notification read status: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Marked as read']);
    }

    protected function dispatchAnnouncementNotifications(Announcement $announcement)
    {
        try {
            if (!$announcement->is_published) {
                Notification::where('type', 'announcement')
                    ->whereRaw("(\"data\"->>'announcement_id') = ?", [(string)$announcement->id])
                    ->delete();
                return;
            }

            $audience = strtolower(trim((string)$announcement->target_audience));
            $query = \App\Models\User::query();

            if ($audience === 'students' || $audience === 'student') {
                $query->whereIn('role', ['student', 'admin', 'administrator']);
            } elseif ($audience === 'teachers' || $audience === 'teacher' || $audience === 'faculty') {
                $query->whereIn('role', ['teacher', 'faculty', 'admin', 'administrator']);
            } elseif ($audience === 'admin' || $audience === 'administrator') {
                $query->whereIn('role', ['admin', 'administrator']);
            }

            $recipientIds = $query->pluck('id');
            if ($recipientIds->isEmpty()) {
                return;
            }

            $contentPreview = \Illuminate\Support\Str::limit($announcement->content, 180);
            $now = now();
            $annDbTimestamp = $announcement->published_at ?? $announcement->created_at ?? $now;
            $annTimestampIso = $announcement->published_at 
                ? (method_exists($announcement->published_at, 'toIso8601String') ? $announcement->published_at->toIso8601String() : (string)$announcement->published_at)
                : ($announcement->created_at 
                    ? (method_exists($announcement->created_at, 'toIso8601String') ? $announcement->created_at->toIso8601String() : (string)$announcement->created_at) 
                    : $now->toIso8601String());

            // Delete any existing notifications for this announcement to prevent duplicates
            Notification::where('type', 'announcement')
                ->whereRaw("(\"data\"->>'announcement_id') = ?", [(string)$announcement->id])
                ->delete();

            $notificationsToInsert = [];
            foreach ($recipientIds as $userId) {
                $notificationsToInsert[] = [
                    'user_id' => $userId,
                    'title' => $announcement->title,
                    'message' => $contentPreview,
                    'type' => 'announcement',
                    'is_read' => false,
                    'read_at' => null,
                    'data' => json_encode([
                        'announcement_id' => $announcement->id,
                        'target_audience' => $announcement->target_audience,
                        'published_at' => $announcement->published_at ? $announcement->published_at->toIso8601String() : null,
                        'announcement_timestamp' => $annTimestampIso,
                    ]),
                    'created_at' => $annDbTimestamp,
                    'updated_at' => $now,
                ];
            }

            foreach (array_chunk($notificationsToInsert, 100) as $chunk) {
                Notification::insert($chunk);
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Notification dispatch error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
        }
    }
}
