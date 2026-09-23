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
            return response()->json(Announcement::with('author')->latest()->get());
        }
        
        $role = strtolower(trim((string)($user ? $user->role : '')));
        $audiences = ['all', $role];
        if (in_array($role, ['teacher', 'faculty'])) {
            $audiences = array_unique(array_merge($audiences, ['teacher', 'teachers', 'faculty']));
        } elseif (in_array($role, ['student'])) {
            $audiences = array_unique(array_merge($audiences, ['student', 'students']));
        }

        return response()->json(
            Announcement::where('is_published', true)
                ->whereIn('target_audience', $audiences)
                ->with('author')
                ->latest()
                ->get()
        );
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

        return response()->json($announcement->load('author'), 201);
    }

    public function update(Request $request, $id)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        $announcement = Announcement::findOrFail($id);
        $announcement->update($request->only(['title', 'content', 'target_audience', 'is_published']));
        return response()->json($announcement->load('author'));
    }

    public function destroy(Request $request, $id)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        $announcement = Announcement::findOrFail($id);
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
        return response()->json(['message' => 'Marked as read']);
    }
}
