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
        if ($user->isAdmin()) {
            return response()->json(Announcement::with('author')->latest()->get());
        }
        
        return response()->json(
            Announcement::where('is_published', true)
                ->whereIn('target_audience', ['all', $user->role])
                ->with('author')
                ->latest()
                ->get()
        );
    }

    public function teacherIndex(Request $request)
    {
        $user = $request->user();
        return response()->json(
            Announcement::where('author_id', $user->id)
                ->with('author')
                ->latest()
                ->get()
        );
    }

    public function show($id)
    {
        $announcement = Announcement::with('author')->findOrFail($id);
        return response()->json($announcement);
    }

    public function store(Request $request)
    {
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
        $announcement = Announcement::findOrFail($id);
        $announcement->update($request->only(['title', 'content', 'target_audience', 'is_published']));
        return response()->json($announcement->load('author'));
    }

    public function destroy($id)
    {
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
