<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EnrollmentService;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    protected $enrollmentService;

    public function __construct(EnrollmentService $enrollmentService)
    {
        $this->enrollmentService = $enrollmentService;
    }

    public function index(Request $request)
    {
        $query = Enrollment::with(['student.user', 'student.course', 'semester', 'subjects.subject']);
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        return response()->json($query->paginate($request->get('per_page', 15)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'semester_id' => 'required|exists:semesters,id',
            'subjects' => 'array',
        ]);

        $enrollment = Enrollment::create([
            'student_id' => $validated['student_id'],
            'semester_id' => $validated['semester_id'],
            'status' => 'pending',
            'enrolled_at' => now(),
        ]);

        return response()->json($enrollment, 201);
    }

    public function approve(Request $request, $id)
    {
        $enrollment = Enrollment::findOrFail($id);
        $enrollment->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
        ]);
        return response()->json($enrollment);
    }

    public function reject(Request $request, $id)
    {
        $enrollment = Enrollment::findOrFail($id);
        $enrollment->update([
            'status' => 'rejected',
            'remarks' => $request->input('remarks', 'Enrollment application rejected'),
        ]);
        return response()->json($enrollment);
    }

    public function studentEnrollments($studentId, Request $request)
    {
        $enrollments = Enrollment::where('student_id', $studentId)
            ->with(['subjects.subject', 'semester'])
            ->get();
        return response()->json($enrollments);
    }
}
