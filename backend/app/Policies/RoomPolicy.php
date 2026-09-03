<?php
namespace App\Policies;
use App\Models\User;
use App\Models\Room;
use Illuminate\Auth\Access\HandlesAuthorization;
class RoomPolicy {
    use HandlesAuthorization;
    public function viewAny(User $user) { return true; }
    public function view(User $user, Room $model) { return true; }
    public function create(User $user) { return $user->role === 'admin'; }
    public function update(User $user, Room $model) { return $user->role === 'admin'; }
    public function delete(User $user, Room $model) { return $user->role === 'admin'; }
}
