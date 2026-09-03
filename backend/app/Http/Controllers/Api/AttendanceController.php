<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\AttendanceRecord;

class AttendanceController extends Controller
{
    protected $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'section_id' => 'nullable|exists:sections,id',
            'teacher_id' => 'nullable|exists:teachers,id',
            'date' => 'required|date',
            'records' => 'nullable|array',
        ]);

        $teacher = $request->user()->teacher;
        if ($teacher) {
            $validated['teacher_id'] = $teacher->id;
        }

        $attendance = Attendance::create([
            'subject_id' => $validated['subject_id'],
            'section_id' => $validated['section_id'] ?? 1,
            'teacher_id' => $validated['teacher_id'] ?? 1,
            'date' => $validated['date'],
            'semester_id' => 1,
        ]);

        if (!empty($request->records)) {
            foreach ($request->records as $rec) {
                AttendanceRecord::create([
                    'attendance_id' => $attendance->id,
                    'student_id' => $rec['student_id'],
                    'status' => $rec['status'],
                    'time_recorded' => now()->toTimeString(),
                ]);
            }
        }

        return response()->json($attendance->load('records'), 201);
    }

    public function getBySubject(Request $request)
    {
        $query = Attendance::with(['subject', 'section', 'records.student.user']);
        if ($request->has('subject_id') && $request->subject_id) {
            $query->where('subject_id', $request->subject_id);
        }
        if ($request->has('section_id') && $request->section_id) {
            $query->where('section_id', $request->section_id);
        }

        return response()->json($query->get());
    }

    public function adminIndex(Request $request)
    {
        $query = Attendance::with(['subject', 'section', 'teacher.user', 'records']);
        return response()->json($query->paginate($request->get('per_page', 15)));
    }
}
