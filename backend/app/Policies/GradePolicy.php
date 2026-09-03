<?php
namespace App\Policies;
use App\Models\User;
use App\Models\Grade;
use Illuminate\Auth\Access\HandlesAuthorization;
class GradePolicy {
    use HandlesAuthorization;
    public function viewAny(User $user) { return in_array($user->role, ['admin', 'teacher']); }
    public function view(User $user, Grade $model) { return in_array($user->role, ['admin']) || ($user->role === 'teacher' && $user->teacher && $user->teacher->id === $model->teacher_id) || ($user->role === 'student' && $user->student && $user->student->id === $model->student_id); }
    public function create(User $user) { return $user->role === 'teacher'; }
    public function update(User $user, Grade $model) { return $user->role === 'teacher' && $user->teacher && $user->teacher->id === $model->teacher_id && !$model->is_submitted; }
    public function submit(User $user, Grade $model) { return $user->role === 'teacher' && $user->teacher && $user->teacher->id === $model->teacher_id; }
    public function finalize(User $user, Grade $model) { return $user->role === 'admin'; }
}
