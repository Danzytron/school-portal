<?php
namespace App\Policies;
use App\Models\User;
use App\Models\Document;
use Illuminate\Auth\Access\HandlesAuthorization;
class DocumentPolicy {
    use HandlesAuthorization;
    public function viewAny(User $user) { return true; }
    public function view(User $user, Document $model) { return true; }
    public function create(User $user) { return in_array($user->role, ['admin', 'teacher']); }
    public function update(User $user, Document $model) { return $user->role === 'admin' || $user->id === $model->uploaded_by; }
    public function delete(User $user, Document $model) { return $user->role === 'admin' || $user->id === $model->uploaded_by; }
}
