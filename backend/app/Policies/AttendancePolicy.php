<?php
namespace App\Policies;
use App\Models\User;
use App\Models\Attendance;
use Illuminate\Auth\Access\HandlesAuthorization;
class AttendancePolicy {
    use HandlesAuthorization;
    public function viewAny(User $user) { return in_array($user->role, ['admin', 'teacher']); }
    public function view(User $user, Attendance $model) { return in_array($user->role, ['admin']) || ($user->role === 'teacher' && $user->teacher && $user->teacher->id === $model->teacher_id); }
    public function create(User $user) { return $user->role === 'teacher'; }
}
