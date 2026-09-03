<?php
namespace App\Policies;
use App\Models\User;
use App\Models\Announcement;
use Illuminate\Auth\Access\HandlesAuthorization;
class AnnouncementPolicy {
    use HandlesAuthorization;
    public function viewAny(User $user) { return true; }
    public function view(User $user, Announcement $model) { return true; }
    public function create(User $user) { return in_array($user->role, ['admin', 'teacher']); }
    public function update(User $user, Announcement $model) { return $user->role === 'admin' || $user->id === $model->author_id; }
    public function delete(User $user, Announcement $model) { return $user->role === 'admin' || $user->id === $model->author_id; }
}
