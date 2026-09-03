<?php
namespace App\Policies;
use App\Models\User;
use App\Models\Section;
use Illuminate\Auth\Access\HandlesAuthorization;
class SectionPolicy {
    use HandlesAuthorization;
    public function viewAny(User $user) { return true; }
    public function view(User $user, Section $model) { return true; }
    public function create(User $user) { return $user->role === 'admin'; }
    public function update(User $user, Section $model) { return $user->role === 'admin'; }
    public function delete(User $user, Section $model) { return $user->role === 'admin'; }
}
