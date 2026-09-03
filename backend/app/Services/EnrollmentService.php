<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\EnrollmentSubject;
use Illuminate\Support\Facades\DB;

class EnrollmentService
{
    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {
            $enrollment = Enrollment::create([
                'student_id' => $data['student_id'],
                'semester_id' => $data['semester_id'],
                'status' => 'pending',
                'enrolled_at' => now(),
            ]);

            if (isset($data['subjects']) && is_array($data['subjects'])) {
                foreach ($data['subjects'] as $subject) {
                    EnrollmentSubject::create([
                        'enrollment_id' => $enrollment->id,
                        'subject_id' => $subject['subject_id'],
                        'section_id' => $subject['section_id'],
                        'schedule_id' => $subject['schedule_id'] ?? null,
                    ]);
                }
            }

            return $enrollment->load('enrollmentSubjects');
        });
    }

    public function approve(Enrollment $enrollment, $userId)
    {
        $enrollment->update([
            'status' => 'approved',
            'approved_by' => $userId,
        ]);
        
        // Update student status to enrolled
        $enrollment->student->update(['enrollment_status' => 'enrolled']);
        
        return $enrollment;
    }

    public function reject(Enrollment $enrollment, $remarks = null)
    {
        $enrollment->update([
            'status' => 'rejected',
            'remarks' => $remarks,
        ]);
        return $enrollment;
    }
    
    public function cancel(Enrollment $enrollment, $remarks = null)
    {
        $enrollment->update([
            'status' => 'cancelled',
            'remarks' => $remarks,
        ]);
        return $enrollment;
    }

    public function getStudentEnrollment($studentId, $semesterId = null)
    {
        $query = Enrollment::where('student_id', $studentId)
            ->with(['enrollmentSubjects.subject', 'enrollmentSubjects.schedule', 'semester']);
            
        if ($semesterId) {
            $query->where('semester_id', $semesterId);
        }
        
        return $query->get();
    }
}
