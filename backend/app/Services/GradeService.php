<?php

namespace App\Services;

use App\Models\Grade;
use Illuminate\Support\Facades\DB;

class GradeService
{
    public function submit(array $data)
    {
        return DB::transaction(function () use ($data) {
            $grade = Grade::updateOrCreate(
                [
                    'student_id' => $data['student_id'],
                    'subject_id' => $data['subject_id'],
                    'semester_id' => $data['semester_id'],
                    'section_id' => $data['section_id'],
                ],
                [
                    'teacher_id' => $data['teacher_id'],
                    'midterm' => $data['midterm'] ?? null,
                    'final' => $data['final'] ?? null,
                    'remarks' => $data['remarks'] ?? null,
                ]
            );
            
            // Calculate final grade if both midterm and final are present
            if ($grade->midterm !== null && $grade->final !== null) {
                $grade->final_grade = ($grade->midterm + $grade->final) / 2;
                $grade->save();
            }
            
            return $grade;
        });
    }

    public function update(Grade $grade, array $data)
    {
        $grade->update($data);
        
        if ($grade->midterm !== null && $grade->final !== null) {
            $grade->final_grade = ($grade->midterm + $grade->final) / 2;
            $grade->save();
        }
        
        return $grade;
    }

    public function finalize(Grade $grade)
    {
        $grade->update([
            'is_submitted' => true,
            'submitted_at' => now(),
        ]);
        return $grade;
    }

    public function getStudentGrades($studentId, $semesterId = null)
    {
        $query = Grade::where('student_id', $studentId)->with(['subject', 'teacher']);
        if ($semesterId) {
            $query->where('semester_id', $semesterId);
        }
        return $query->get();
    }

    public function getClassGrades($subjectId, $sectionId, $semesterId)
    {
        return Grade::where([
            'subject_id' => $subjectId,
            'section_id' => $sectionId,
            'semester_id' => $semesterId,
        ])->with('student.user')->get();
    }
}
