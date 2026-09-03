<?php

namespace App\Services;

use App\Models\Teacher;
use App\Models\User;
use App\Models\TeacherSubject;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class TeacherService
{
    public function getAll()
    {
        return Teacher::with('user')->get();
    }

    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password'] ?? 'password'),
                'role' => 'teacher',
            ]);

            return Teacher::create([
                'user_id' => $user->id,
                'employee_id' => $data['employee_id'],
                'department' => $data['department'] ?? null,
                'specialization' => $data['specialization'] ?? null,
                'contact_number' => $data['contact_number'] ?? null,
            ]);
        });
    }

    public function update(Teacher $teacher, array $data)
    {
        return DB::transaction(function () use ($teacher, $data) {
            if (isset($data['name']) || isset($data['email'])) {
                $teacher->user->update([
                    'name' => $data['name'] ?? $teacher->user->name,
                    'email' => $data['email'] ?? $teacher->user->email,
                ]);
            }
            
            if (isset($data['password'])) {
                $teacher->user->update([
                    'password' => Hash::make($data['password'])
                ]);
            }

            $teacher->update($data);
            return $teacher;
        });
    }

    public function delete(Teacher $teacher)
    {
        return DB::transaction(function () use ($teacher) {
            $teacher->user()->delete();
            return $teacher->delete();
        });
    }

    public function getAssignedSubjects($teacherId, $semesterId = null)
    {
        $query = TeacherSubject::where('teacher_id', $teacherId)->with(['subject', 'section']);
        
        if ($semesterId) {
            $query->where('semester_id', $semesterId);
        }
        
        return $query->get();
    }
}
