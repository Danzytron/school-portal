<?php

namespace App\Services;

use App\Models\Announcement;
use App\Models\AnnouncementRead;

class AnnouncementService
{
    public function getAll()
    {
        return Announcement::with('author')->latest()->get();
    }
    
    public function getForUser($role)
    {
        return Announcement::where('is_published', true)
            ->whereIn('target_audience', ['all', $role])
            ->with('author')
            ->latest()
            ->get();
    }

    public function create(array $data)
    {
        return Announcement::create($data);
    }

    public function update(Announcement $announcement, array $data)
    {
        $announcement->update($data);
        return $announcement;
    }

    public function delete(Announcement $announcement)
    {
        return $announcement->delete();
    }

    public function publish(Announcement $announcement)
    {
        $announcement->update([
            'is_published' => true,
            'published_at' => now(),
        ]);
        return $announcement;
    }

    public function markAsRead(Announcement $announcement, $userId)
    {
        return AnnouncementRead::firstOrCreate([
            'announcement_id' => $announcement->id,
            'user_id' => $userId,
        ], [
            'read_at' => now(),
        ]);
    }
}
