<?php
namespace App\Policies;
use App\Models\User;
use App\Models\Subject;
use Illuminate\Auth\Access\HandlesAuthorization;
class SubjectPolicy {
    use HandlesAuthorization;
    public function viewAny(User $user) { return true; }
    public function view(User $user, Subject $model) { return true; }
    public function create(User $user) { return $user->role === 'admin'; }
    public function update(User $user, Subject $model) { return $user->role === 'admin'; }
    public function delete(User $user, Subject $model) { return $user->role === 'admin'; }
}
