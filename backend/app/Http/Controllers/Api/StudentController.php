<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StudentService;
use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Grade;
use App\Models\AttendanceRecord;
use App\Models\Enrollment;
use App\Models\EnrollmentSubject;
use App\Models\Schedule;
use App\Models\SchoolFee;
use App\Models\Document;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    protected $studentService;

    public function __construct(StudentService $studentService)
    {
        $this->studentService = $studentService;
    }

    public function index(Request $request)
    {
        $query = Student::with(['user', 'course', 'section']);
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
            })->orWhere('student_id_number', 'like', "%{$search}%");
        }
        if ($request->has('course_id') && $request->course_id) {
            $query->where('course_id', $request->course_id);
        }
        if ($request->has('year_level') && $request->year_level) {
            $query->where('year_level', $request->year_level);
        }
        return response()->json($query->paginate($request->get('per_page', 15)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'student_id_number' => 'required|string|unique:students',
            'course_id' => 'nullable|exists:courses,id',
            'year_level' => 'integer',
            'section_id' => 'nullable|exists:sections,id',
            'contact_number' => 'nullable|string',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make('Portal2025!'),
            'role' => 'student',
        ]);

        $student = Student::create([
            'user_id' => $user->id,
            'student_id_number' => $validated['student_id_number'],
            'course_id' => $validated['course_id'] ?? null,
            'year_level' => $validated['year_level'] ?? 1,
            'section_id' => $validated['section_id'] ?? null,
            'contact_number' => $validated['contact_number'] ?? null,
            'address' => $validated['address'] ?? null,
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'enrollment_status' => 'enrolled',
        ]);

        return response()->json($student->load(['user', 'course', 'section']), 201);
    }

    public function show($id)
    {
        $student = Student::with(['user', 'course', 'section'])->findOrFail($id);
        return response()->json($student);
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);
        if ($request->has('name')) {
            $student->user->update(['name' => $request->name]);
        }
        if ($request->has('email')) {
            $student->user->update(['email' => $request->email]);
        }
        $student->update($request->only(['course_id', 'year_level', 'section_id', 'contact_number', 'address', 'date_of_birth', 'enrollment_status']));
        return response()->json($student->load(['user', 'course', 'section']));
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);
        $student->user()->delete();
        $student->delete();
        return response()->json(['message' => 'Student deleted successfully']);
    }

    public function resetPassword(Request $request, $id)
    {
        $student = Student::findOrFail($id);
        $student->user->update(['password' => Hash::make('Portal2025!')]);
        return response()->json(['message' => 'Password reset to Portal2025!']);
    }

    public function profile(Request $request)
    {
        $student = $request->user()->student;
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }
        return response()->json($student->load(['user', 'course', 'section']));
    }

    public function updateProfile(Request $request)
    {
        $student = $request->user()->student;
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }
        $student->update($request->only(['contact_number', 'address']));
        return response()->json($student->load(['user', 'course', 'section']));
    }

    public function subjects(Request $request)
    {
        $student = $request->user()->student;
        if (!$student) return response()->json([]);

        $subjects = EnrollmentSubject::whereHas('enrollment', function($q) use ($student) {
            $q->where('student_id', $student->id)->where('status', 'approved');
        })->with(['subject', 'section', 'schedule.teacher.user', 'schedule.room'])->get();

        return response()->json($subjects);
    }

    public function schedule(Request $request)
    {
        $student = $request->user()->student;
        if (!$student) return response()->json([]);

        $schedules = Schedule::whereHas('section', function($q) use ($student) {
            $q->where('id', $student->section_id);
        })->with(['subject', 'section', 'teacher.user', 'room'])->get();

        return response()->json($schedules);
    }

    public function grades(Request $request)
    {
        $student = $request->user()->student;
        if (!$student) return response()->json([]);

        $grades = Grade::where('student_id', $student->id)
            ->with(['subject', 'teacher.user'])
            ->get();

        return response()->json($grades);
    }

    public function attendance(Request $request)
    {
        $student = $request->user()->student;
        if (!$student) return response()->json([]);

        $records = AttendanceRecord::where('student_id', $student->id)
            ->with(['attendance.subject'])
            ->latest()
            ->get();

        return response()->json($records);
    }

    public function enrollment(Request $request)
    {
        $student = $request->user()->student;
        if (!$student) return response()->json(['status' => 'not_enrolled', 'subjects' => []]);

        $enrollment = Enrollment::where('student_id', $student->id)
            ->with(['subjects.subject', 'semester'])
            ->latest()
            ->first();

        return response()->json($enrollment ?? ['status' => 'not_enrolled', 'subjects' => []]);
    }

    public function enroll(Request $request)
    {
        $student = $request->user()->student;
        if (!$student) return response()->json(['message' => 'Student record missing'], 400);

        $enrollment = Enrollment::create([
            'student_id' => $student->id,
            'semester_id' => 1,
            'status' => 'pending',
            'enrolled_at' => now(),
        ]);

        if ($request->has('subject_ids')) {
            foreach ($request->subject_ids as $subId) {
                EnrollmentSubject::create([
                    'enrollment_id' => $enrollment->id,
                    'subject_id' => $subId,
                    'section_id' => $student->section_id,
                ]);
            }
        }

        return response()->json($enrollment->load(['subjects.subject']));
    }

    public function fees(Request $request)
    {
        $student = $request->user()->student;
        if (!$student) return response()->json(null);

        $fee = SchoolFee::where('student_id', $student->id)->with('payments')->first();
        return response()->json($fee);
    }

    public function documents(Request $request)
    {
        $student = $request->user()->student;
        if (!$student) return response()->json([]);

        $docs = Document::where(function($q) use ($student) {
            $q->where('section_id', $student->section_id)->orWhereNull('section_id');
        })->with('subject')->get();

        return response()->json($docs);
    }
}
