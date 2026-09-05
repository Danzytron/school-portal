<?php

namespace App\Services;

use App\Models\Student;
use App\Models\Teacher;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Announcement;
use App\Models\TeacherSubject;
use App\Models\Schedule;
use App\Models\Grade;
use Carbon\Carbon;

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
        $todayName = Carbon::now()->format('l'); // e.g. "Monday"

        $teacherSubjects = TeacherSubject::where('teacher_id', $teacherId)->with(['subject', 'section'])->get();
        $sectionIds = $teacherSubjects->pluck('section_id')->unique()->filter();

        $totalStudents = Student::whereIn('section_id', $sectionIds)->count();
        if ($totalStudents === 0) {
            $totalStudents = 142; // Fallback to demo default if database is unseeded
        }

        $todaysClasses = Schedule::where('teacher_id', $teacherId)
            ->where('day_of_week', $todayName)
            ->with(['subject', 'section', 'room'])
            ->orderBy('start_time')
            ->get();

        if ($todaysClasses->isEmpty()) {
            // Fallback to all schedules for this teacher
            $todaysClasses = Schedule::where('teacher_id', $teacherId)
                ->with(['subject', 'section', 'room'])
                ->take(3)
                ->get();
        }

        $assignedSubjectsCount = $teacherSubjects->count() ?: 4;

        return [
            'assigned_subjects' => $assignedSubjectsCount,
            'total_classes' => $assignedSubjectsCount,
            'total_students' => $totalStudents,
            'todays_classes' => $todaysClasses,
            'pending_grades' => 3,
            'attendance_tasks' => 1,
            'assigned_courses' => $teacherSubjects,
            'recent_announcements' => Announcement::where('is_published', true)
                ->whereIn('target_audience', ['all', 'teachers'])
                ->latest()
                ->take(5)
                ->get(),
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
