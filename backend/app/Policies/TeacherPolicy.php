<?php
namespace App\Policies;
use App\Models\User;
use App\Models\Teacher;
use Illuminate\Auth\Access\HandlesAuthorization;
class TeacherPolicy {
    use HandlesAuthorization;
    public function viewAny(User $user) { return $user->role === 'admin'; }
    public function view(User $user, Teacher $model) { return $user->role === 'admin' || ($user->role === 'teacher' && $user->teacher && $user->teacher->id === $model->id); }
    public function create(User $user) { return $user->role === 'admin'; }
    public function update(User $user, Teacher $model) { return $user->role === 'admin' || ($user->role === 'teacher' && $user->teacher && $user->teacher->id === $model->id); }
    public function delete(User $user, Teacher $model) { return $user->role === 'admin'; }
}
