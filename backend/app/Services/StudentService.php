<?php

namespace App\Services;

use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class StudentService
{
    public function getAll()
    {
        return Student::with(['user', 'course', 'section'])->get();
    }
    
    public function getById($id)
    {
        return Student::with(['user', 'course', 'section'])->findOrFail($id);
    }

    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password'] ?? 'password'),
                'role' => 'student',
            ]);

            return Student::create([
                'user_id' => $user->id,
                'student_id_number' => $data['student_id_number'],
                'course_id' => $data['course_id'] ?? null,
                'year_level' => $data['year_level'] ?? 1,
                'section_id' => $data['section_id'] ?? null,
                'contact_number' => $data['contact_number'] ?? null,
                'address' => $data['address'] ?? null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'enrollment_status' => $data['enrollment_status'] ?? 'not_enrolled',
            ]);
        });
    }

    public function update(Student $student, array $data)
    {
        return DB::transaction(function () use ($student, $data) {
            if (isset($data['name']) || isset($data['email'])) {
                $student->user->update([
                    'name' => $data['name'] ?? $student->user->name,
                    'email' => $data['email'] ?? $student->user->email,
                ]);
            }
            
            if (isset($data['password'])) {
                $student->user->update([
                    'password' => Hash::make($data['password'])
                ]);
            }

            $student->update($data);
            return $student;
        });
    }

    public function delete(Student $student)
    {
        return DB::transaction(function () use ($student) {
            $student->user()->delete();
            return $student->delete();
        });
    }

    public function getBySection($sectionId)
    {
        return Student::where('section_id', $sectionId)->with('user')->get();
    }

    public function getByCourse($courseId)
    {
        return Student::where('course_id', $courseId)->with('user')->get();
    }
}
