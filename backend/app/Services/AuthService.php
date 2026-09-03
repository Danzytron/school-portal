<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthService
{
    public function login(array $credentials)
    {
        if (!Auth::attempt($credentials)) {
            return null;
        }

        $user = Auth::user();
        if (!$user->is_active) {
            Auth::logout();
            return null;
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function logout(User $user)
    {
        $user->tokens()->delete();
        return true;
    }

    public function getCurrentUser(User $user)
    {
        return $user->load(['student', 'teacher', 'admin']);
    }
}
