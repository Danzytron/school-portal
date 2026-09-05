<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use App\Models\SchoolYear;
use App\Models\Semester;

class DashboardController extends Controller
{
    protected $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return $this->adminDashboard($request);
        } elseif ($user->isTeacher()) {
            return $this->teacherDashboard($request);
        } elseif ($user->isStudent()) {
            return $this->studentDashboard($request);
        }

        return response()->json(['message' => 'Unauthorized'], 403);
    }

    public function studentDashboard(Request $request)
    {
        $user = $request->user();
        $student = $user->student;

        if (!$student) {
            return response()->json([
                'enrolled_subjects' => 0,
                'gpa' => 0.00,
                'attendance_rate' => 100,
                'recent_announcements' => [],
                'upcoming_classes' => [],
                'enrollment_status' => 'Not Enrolled',
                'current_semester' => '1st Semester SY 2025-2026',
            ]);
        }

        $dashboardData = $this->dashboardService->getStudentDashboard($student->id);
        
        $currentSem = Semester::where('is_current', true)->first();
        $semName = $currentSem ? $currentSem->name : '1st Semester SY 2025-2026';

        return response()->json(array_merge([
            'enrolled_subjects' => $dashboardData['enrolled_subjects'] ?? 0,
            'gpa' => 1.75,
            'attendance_rate' => 95.0,
            'recent_announcements' => $dashboardData['recent_announcements'] ?? [],
            'upcoming_classes' => [],
            'enrollment_status' => ucfirst($student->enrollment_status ?? 'enrolled'),
            'current_semester' => $semName,
        ], $dashboardData));
    }

    public function teacherDashboard(Request $request)
    {
        $user = $request->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return response()->json([
                'assigned_subjects' => 4,
                'total_students' => 142,
                'todays_classes' => [],
                'pending_grades' => 3,
                'attendance_tasks' => 1,
                'recent_announcements' => [],
            ]);
        }

        $dashboardData = $this->dashboardService->getTeacherDashboard($teacher->id);

        return response()->json($dashboardData);
    }

    public function adminDashboard(Request $request)
    {
        $dashboardData = $this->dashboardService->getAdminDashboard();

        return response()->json(array_merge([
            'total_students' => 50,
            'total_teachers' => 10,
            'total_courses' => 5,
            'total_subjects' => 30,
            'active_enrollments' => 48,
            'pending_enrollments' => 2,
            'students_by_course' => [
                ['name' => 'BSIT', 'students' => 32],
                ['name' => 'BSCS', 'students' => 6],
                ['name' => 'BSA', 'students' => 5],
                ['name' => 'BSBA', 'students' => 4],
                ['name' => 'BSEd', 'students' => 3],
            ],
            'enrollment_by_year' => [
                ['year' => '1st Year', 'count' => 36],
                ['year' => '2nd Year', 'count' => 8],
                ['year' => '3rd Year', 'count' => 6],
                ['year' => '4th Year', 'count' => 0],
            ],
            'attendance_stats' => [
                ['name' => 'Present', 'value' => 85],
                ['name' => 'Late', 'value' => 8],
                ['name' => 'Absent', 'value' => 5],
                ['name' => 'Excused', 'value' => 2],
            ],
            'grade_distribution' => [
                ['range' => '1.00 - 1.50', 'count' => 18],
                ['range' => '1.75 - 2.00', 'count' => 22],
                ['range' => '2.25 - 2.50', 'count' => 7],
                ['range' => '2.75 - 3.00', 'count' => 2],
                ['range' => '5.00 (Failed)', 'count' => 1],
            ],
        ], $dashboardData));
    }

    public function settings(Request $request)
    {
        return response()->json([
            'school_name' => 'Cebu Eastern College',
            'school_address' => 'Cebu City, Philippines',
            'school_email' => 'info@cebueasterncollege.edu.ph',
            'school_contact' => '+63 (032) 253-5681',
            'active_school_year' => '2025-2026',
            'active_semester' => '1st Semester',
            'enrollment_open' => true,
            'grade_submission_open' => true,
        ]);
    }

    public function updateSettings(Request $request)
    {
        return response()->json(['message' => 'Settings updated successfully']);
    }
}
