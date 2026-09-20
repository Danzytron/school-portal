<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthService
{
    public function login(array $credentials)
    {
        $input = trim($credentials['email'] ?? $credentials['login'] ?? '');
        $password = $credentials['password'] ?? '';

        if (empty($input) || empty($password)) {
            return null;
        }

        // 1. Direct email lookup (case-insensitive)
        $user = User::whereRaw('LOWER(email) = ?', [strtolower($input)])->first();

        // 2. Student ID Number lookup (e.g. "2026-00001")
        if (!$user) {
            $student = \App\Models\Student::where('student_id_number', $input)
                ->orWhere('student_id_number', 'LIKE', "%{$input}%")
                ->first();
            if ($student && $student->user) {
                $user = $student->user;
            }
        }

        // 3. Teacher Employee ID lookup (e.g. "TCH-2026-001")
        if (!$user) {
            $teacher = \App\Models\Teacher::where('employee_id', $input)->first();
            if ($teacher && $teacher->user) {
                $user = $teacher->user;
            }
        }

        // 4. Admin Employee ID lookup (e.g. "ADM-2026-001")
        if (!$user) {
            $admin = \App\Models\Admin::where('employee_id', $input)->first();
            if ($admin && $admin->user) {
                $user = $admin->user;
            }
        }

        // 5. Common shorthand aliases
        if (!$user) {
            $normalized = strtolower($input);
            if (in_array($normalized, ['student', 'roldan', 'delarmente', 'roldan jr'])) {
                $user = User::where('email', 'student@schoolportal.test')->first();
            } elseif (in_array($normalized, ['teacher', 'faculty', 'beiber', 'justin'])) {
                $user = User::where('email', 'teacher@schoolportal.test')->first();
            } elseif (in_array($normalized, ['admin', 'registrar'])) {
                $user = User::where('email', 'admin@schoolportal.test')->first();
            }
        }

        if (!$user) {
            return null;
        }

        if (!Hash::check($password, $user->password)) {
            return null;
        }

        if (!$user->is_active) {
            return null;
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user->load(['student', 'teacher', 'admin']),
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
