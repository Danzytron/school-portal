<?php
namespace App\Policies;
use App\Models\User;
use App\Models\Course;
use Illuminate\Auth\Access\HandlesAuthorization;
class CoursePolicy {
    use HandlesAuthorization;
    public function viewAny(User $user) { return true; }
    public function view(User $user, Course $model) { return true; }
    public function create(User $user) { return $user->role === 'admin'; }
    public function update(User $user, Course $model) { return $user->role === 'admin'; }
    public function delete(User $user, Course $model) { return $user->role === 'admin'; }
}
