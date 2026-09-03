<?php

namespace App\Services;

use App\Models\Student;
use App\Models\Teacher;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Announcement;

class DashboardService
{
    public function getAdminDashboard()
    {
        return [
            'total_students' => Student::count(),
            'total_teachers' => Teacher::count(),
            'total_courses' => Course::count(),
            'pending_enrollments' => Enrollment::where('status', 'pending')->count(),
            'recent_announcements' => Announcement::latest()->take(5)->get(),
        ];
    }

    public function getTeacherDashboard($teacherId)
    {
        // Add specific logic for teacher stats
        return [
            'total_classes' => \App\Models\TeacherSubject::where('teacher_id', $teacherId)->count(),
            'recent_announcements' => Announcement::where('is_published', true)
                ->whereIn('target_audience', ['all', 'teachers'])
                ->latest()->take(5)->get(),
        ];
    }

    public function getStudentDashboard($studentId)
    {
        return [
            'enrolled_subjects' => \App\Models\EnrollmentSubject::whereHas('enrollment', function($q) use ($studentId) {
                $q->where('student_id', $studentId)->where('status', 'approved');
            })->count(),
            'recent_announcements' => Announcement::where('is_published', true)
                ->whereIn('target_audience', ['all', 'students'])
                ->latest()->take(5)->get(),
        ];
    }
}
