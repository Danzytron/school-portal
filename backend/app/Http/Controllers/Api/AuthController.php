<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255',
            'password' => 'required|string|max:255',
        ]);

        $ip = $request->ip();
        $email = strtolower(trim($request->input('email')));

        $result = $this->authService->login([
            'email' => $email,
            'password' => $request->input('password')
        ]);

        if (!$result) {
            Log::warning("[SECURITY AUDIT] Failed login attempt for {$email} from IP {$ip}");
            return response()->json(['message' => 'Invalid email or password.'], 401);
        }

        Log::info("[SECURITY AUDIT] Successful login for user {$email} (Role: {$result['user']->role}) from IP {$ip}");

        return response()->json([
            'message' => 'Login successful',
            'user' => $result['user'],
            'token' => $result['token'],
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            Log::info("[SECURITY AUDIT] User {$user->email} logged out from IP {$request->ip()}");
            $this->authService->logout($user);
        }
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $this->authService->getCurrentUser($request->user())
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            Log::warning("[SECURITY AUDIT] Failed password change attempt for {$user->email} from IP {$request->ip()} - invalid current password");
            return response()->json(['message' => 'The provided current password does not match our records.'], 422);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        Log::info("[SECURITY AUDIT] Password changed successfully for user {$user->email} from IP {$request->ip()}");

        return response()->json(['message' => 'Password updated successfully.']);
    }
}
