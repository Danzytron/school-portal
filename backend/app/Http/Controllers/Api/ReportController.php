<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Grade;
use App\Models\AttendanceRecord;

class ReportController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function enrollment(Request $request)
    {
        return response()->json([
            'total_enrolled' => Student::where('enrollment_status', 'enrolled')->count(),
            'students' => Student::with(['user', 'course', 'section'])->get(),
        ]);
    }

    public function grades(Request $request)
    {
        return response()->json([
            'total_grades' => Grade::count(),
            'grades' => Grade::with(['student.user', 'subject'])->get(),
        ]);
    }

    public function generate(Request $request, $type)
    {
        if ($type === 'enrollment') {
            return $this->enrollment($request);
        } elseif ($type === 'grades') {
            return $this->grades($request);
        } elseif ($type === 'attendance') {
            return response()->json([
                'total_attendance' => AttendanceRecord::count(),
                'records' => AttendanceRecord::with(['student.user', 'attendance.subject'])->get(),
            ]);
        }

        return response()->json(['message' => 'Invalid report type'], 400);
    }
}
