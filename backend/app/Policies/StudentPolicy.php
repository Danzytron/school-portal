<?php
namespace App\Policies;
use App\Models\User;
use App\Models\Student;
use Illuminate\Auth\Access\HandlesAuthorization;
class StudentPolicy {
    use HandlesAuthorization;
    public function viewAny(User $user) { return $user->role === 'admin'; }
    public function view(User $user, Student $model) { return $user->role === 'admin' || ($user->role === 'student' && $user->student && $user->student->id === $model->id); }
    public function create(User $user) { return $user->role === 'admin'; }
    public function update(User $user, Student $model) { return $user->role === 'admin' || ($user->role === 'student' && $user->student && $user->student->id === $model->id); }
    public function delete(User $user, Student $model) { return $user->role === 'admin'; }
}
