<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Attendance;

class ReportService
{
    public function enrollmentReport($semesterId)
    {
        return Enrollment::where('semester_id', $semesterId)
            ->with(['student.user', 'student.course'])
            ->get()
            ->groupBy('status');
    }

    public function gradeReport($semesterId, $courseId = null)
    {
        $query = Grade::where('semester_id', $semesterId)->with(['student.user', 'subject']);
        
        if ($courseId) {
            $query->whereHas('student', function($q) use ($courseId) {
                $q->where('course_id', $courseId);
            });
        }
        
        return $query->get();
    }

    public function attendanceReport($semesterId, $subjectId = null)
    {
        $query = Attendance::where('semester_id', $semesterId)->with('records');
        if ($subjectId) {
            $query->where('subject_id', $subjectId);
        }
        return $query->get();
    }
}
