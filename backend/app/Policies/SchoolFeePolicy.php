<?php
namespace App\Policies;
use App\Models\User;
use App\Models\SchoolFee;
use Illuminate\Auth\Access\HandlesAuthorization;
class SchoolFeePolicy {
    use HandlesAuthorization;
    public function viewAny(User $user) { return $user->role === 'admin'; }
    public function view(User $user, SchoolFee $model) { return $user->role === 'admin' || ($user->role === 'student' && $user->student && $user->student->id === $model->student_id); }
    public function create(User $user) { return $user->role === 'admin'; }
    public function update(User $user, SchoolFee $model) { return $user->role === 'admin'; }
}
