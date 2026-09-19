<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GradeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Grade;
use App\Models\Student;
use App\Models\User;
use App\Models\Semester;
use App\Models\TeacherSubject;
use App\Models\Schedule;

class GradeController extends Controller
{
    protected $gradeService;

    public function __construct(GradeService $gradeService)
    {
        $this->gradeService = $gradeService;
    }

    public function submit(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'student_id' => 'nullable',
            'name' => 'nullable|string',
            'subject_id' => 'required|exists:subjects,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'section_id' => 'nullable|exists:sections,id',
            'midterm' => 'nullable|numeric|min:1|max:5',
            'final' => 'nullable|numeric|min:1|max:5',
            'final_grade' => 'nullable|numeric|min:1|max:5',
            'remarks' => 'nullable|string|max:255',
        ]);

        $sectionId = $validated['section_id'] ?? 1;

        $student = null;
        $studentInput = $validated['student_id'] ?? null;
        if (!empty($studentInput)) {
            if (is_numeric($studentInput)) {
                $student = Student::where('id', intval($studentInput))
                    ->orWhere('student_id_number', strval($studentInput))
                    ->first();
            } else {
                $student = Student::where('student_id_number', strval($studentInput))->first();
            }
        }
        if (!$student && !empty($request->name)) {
            $name = trim($request->name);
            $student = Student::whereHas('user', function($q) use ($name) {
                $q->where('name', 'ilike', "%{$name}%");
            })->first();

            // Auto-create student in this section if not found so grade addition never fails
            if (!$student) {
                $cleanName = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($name));
                $email = ($cleanName ?: 'student') . rand(100, 9999) . '@schoolportal.test';
                $newUser = User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make('password'),
                    'role' => 'student',
                ]);
                $studentNumber = '2026-' . str_pad(rand(100, 99999), 5, '0', STR_PAD_LEFT);
                $student = Student::create([
                    'user_id' => $newUser->id,
                    'student_id_number' => $studentNumber,
                    'course_id' => 1,
                    'year_level' => 1,
                    'section_id' => $sectionId,
                    'enrollment_status' => 'enrolled',
                ]);
            }
        }

        if (!$student) {
            return response()->json(['message' => 'Please provide a valid student name or ID.'], 422);
        }

        $semesterId = $validated['semester_id'] ?? null;
        if (empty($semesterId)) {
            $activeSem = Semester::where('is_current', true)->first() ?? Semester::first();
            $semesterId = $activeSem ? $activeSem->id : 1;
        }

        $midterm = isset($validated['midterm']) && $validated['midterm'] !== null ? floatval($validated['midterm']) : null;
        $final = isset($validated['final']) && $validated['final'] !== null ? floatval($validated['final']) : null;
        $finalGrade = isset($validated['final_grade']) && $validated['final_grade'] !== null ? floatval($validated['final_grade']) : null;
        if ($finalGrade === null && $midterm !== null && $final !== null) {
            $finalGrade = round(($midterm + $final) / 2, 2);
        }

        $remarks = $validated['remarks'] ?? null;
        if (empty($remarks) && $finalGrade !== null) {
            $remarks = $finalGrade <= 3.00 ? 'Passed' : 'Failed';
        }

        $teacherId = null;
        if ($user->role === 'teacher') {
            $teacher = $user->teacher;
            if (!$teacher) {
                return response()->json(['message' => 'Teacher profile not found'], 403);
            }
            $teacherId = $teacher->id;
        }

        $gradeData = [
            'student_id' => $student->id,
            'subject_id' => $validated['subject_id'],
            'section_id' => $validated['section_id'] ?? ($student->section_id ?? $sectionId),
            'semester_id' => $semesterId,
            'midterm' => $midterm,
            'final' => $final,
            'final_grade' => $finalGrade,
            'remarks' => $remarks,
        ];
        if ($teacherId) {
            $gradeData['teacher_id'] = $teacherId;
        }

        $grade = Grade::updateOrCreate(
            [
                'student_id' => $student->id,
                'subject_id' => $validated['subject_id'],
                'semester_id' => $semesterId,
            ],
            $gradeData
        );

        return response()->json($grade->load(['student.user', 'subject']));
    }

    public function bulkSubmit(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'section_id' => 'required|exists:sections,id',
            'grades' => 'required|array',
        ]);

        $teacherId = null;
        if ($user->role === 'teacher') {
            $teacher = $user->teacher;
            if (!$teacher) {
                return response()->json(['message' => 'Teacher profile not found'], 403);
            }
            $teacherId = $teacher->id;
        }

        $activeSem = Semester::where('is_current', true)->first() ?? Semester::first();
        $semesterId = $activeSem ? $activeSem->id : 1;

        $savedGrades = [];
        foreach ($validated['grades'] as $item) {
            $student = null;
            if (!empty($item['id']) && is_numeric($item['id'])) {
                $existingGrade = Grade::find(intval($item['id']));
                if ($existingGrade) {
                    $student = $existingGrade->student;
                }
            }

            $sId = $item['student_id'] ?? ($item['studentId'] ?? null);
            if (!$student && !empty($sId)) {
                if (is_numeric($sId)) {
                    $student = Student::where('id', intval($sId))
                        ->orWhere('student_id_number', strval($sId))
                        ->first();
                } else {
                    $student = Student::where('student_id_number', strval($sId))->first();
                }
            }
            if (!$student && !empty($item['name'])) {
                $name = trim($item['name']);
                $student = Student::whereHas('user', function($q) use ($name) {
                    $q->where('name', 'ilike', "%{$name}%");
                })->first();

                if (!$student) {
                    $cleanName = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($name));
                    $email = ($cleanName ?: 'student') . rand(100, 9999) . '@schoolportal.test';
                    $newUser = User::create([
                        'name' => $name,
                        'email' => $email,
                        'password' => Hash::make('password'),
                        'role' => 'student',
                    ]);
                    $studentNumber = '2026-' . str_pad(rand(100, 99999), 5, '0', STR_PAD_LEFT);
                    $student = Student::create([
                        'user_id' => $newUser->id,
                        'student_id_number' => $studentNumber,
                        'course_id' => 1,
                        'year_level' => 1,
                        'section_id' => $validated['section_id'],
                        'enrollment_status' => 'enrolled',
                    ]);
                }
            }

            if (!$student) continue;

            $midterm = isset($item['midterm']) && $item['midterm'] !== '' ? floatval($item['midterm']) : null;
            $final = isset($item['final']) && $item['final'] !== '' ? floatval($item['final']) : null;
            $finalGrade = null;
            if ($midterm !== null && $final !== null) {
                $finalGrade = round(($midterm + $final) / 2, 2);
            }

            $remarks = $item['remarks'] ?? null;
            if (!$remarks && $finalGrade !== null) {
                $remarks = $finalGrade <= 3.00 ? 'Passed' : 'Failed';
            }

            $gradeData = [
                'student_id' => $student->id,
                'subject_id' => $validated['subject_id'],
                'section_id' => $validated['section_id'] ?? ($student->section_id ?? 1),
                'semester_id' => $semesterId,
                'midterm' => $midterm,
                'final' => $final,
                'final_grade' => $finalGrade,
                'remarks' => $remarks,
            ];
            if ($teacherId) {
                $gradeData['teacher_id'] = $teacherId;
            }

            $grade = Grade::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'subject_id' => $validated['subject_id'],
                    'semester_id' => $semesterId,
                ],
                $gradeData
            );
            $savedGrades[] = $grade;
        }

        return response()->json(['message' => 'Grades saved successfully', 'count' => count($savedGrades)]);
    }

    public function classGrades(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $query = Grade::with(['student.user', 'subject', 'section']);

        if ($user->role === 'teacher' && $user->teacher) {
            $teacher = $user->teacher;
            $query->where(function($q) use ($teacher) {
                $q->where('teacher_id', $teacher->id)
                  ->orWhereNull('teacher_id');
            });
        }

        if ($request->has('subject_id') && $request->subject_id) {
            $query->where('subject_id', $request->subject_id);
        }
        if ($request->has('section_id') && $request->section_id) {
            $query->where('section_id', $request->section_id);
        }

        return response()->json($query->get());
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $grade = Grade::findOrFail($id);

        if ($user->role === 'teacher') {
            $teacher = $user->teacher;
            if (!$teacher) {
                return response()->json(['message' => 'Teacher profile not found.'], 403);
            }

            $isAssigned = ($grade->teacher_id === $teacher->id) ||
                TeacherSubject::where('teacher_id', $teacher->id)
                    ->where('subject_id', $grade->subject_id)
                    ->where('section_id', $grade->section_id)
                    ->exists() ||
                Schedule::where('teacher_id', $teacher->id)
                    ->where('subject_id', $grade->subject_id)
                    ->where('section_id', $grade->section_id)
                    ->exists();

            if (!$isAssigned) {
                return response()->json(['message' => 'Unauthorized: You can only edit grades for your assigned classes.'], 403);
            }
        }

        $validated = $request->validate([
            'midterm' => 'nullable|numeric|min:1|max:5',
            'final' => 'nullable|numeric|min:1|max:5',
            'final_grade' => 'nullable|numeric|min:1|max:5',
            'remarks' => 'nullable|string|max:255',
            'is_submitted' => 'nullable|boolean',
        ]);

        $newMidterm = array_key_exists('midterm', $validated) ? $validated['midterm'] : $grade->midterm;
        $newFinal = array_key_exists('final', $validated) ? $validated['final'] : $grade->final;

        if (empty($validated['final_grade']) && !is_null($newMidterm) && !is_null($newFinal)) {
            $validated['final_grade'] = round((floatval($newMidterm) + floatval($newFinal)) / 2, 2);
        }

        if (empty($validated['remarks']) && !empty($validated['final_grade'])) {
            $validated['remarks'] = $validated['final_grade'] <= 3.00 ? 'Passed' : 'Failed';
        }

        $grade->update($validated);
        return response()->json($grade->load(['student.user', 'subject']));
    }

    public function submitFinal(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'section_id' => 'required|exists:sections,id',
        ]);

        $query = Grade::where('subject_id', $request->subject_id)
            ->where('section_id', $request->section_id);

        if ($user->role === 'teacher' && $user->teacher) {
            $query->where('teacher_id', $user->teacher->id);
        }

        $query->update(['is_submitted' => true, 'submitted_at' => now()]);
        return response()->json(['message' => 'Grades submitted successfully']);
    }

    public function adminIndex(Request $request)
    {
        $query = Grade::with(['student.user', 'subject', 'teacher.user']);
        if ($request->has('subject_id') && $request->subject_id) {
            $query->where('subject_id', $request->subject_id);
        }
        return response()->json($query->paginate($request->get('per_page', 15)));
    }

    public function finalize(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $grade = Grade::findOrFail($id);
        $grade->update(['is_submitted' => true, 'submitted_at' => now()]);
        return response()->json($grade);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $grade = Grade::findOrFail($id);

        if ($user->role === 'teacher') {
            $teacher = $user->teacher;
            if (!$teacher) {
                return response()->json(['message' => 'Teacher profile not found.'], 403);
            }

            $isAssigned = ($grade->teacher_id === $teacher->id) ||
                TeacherSubject::where('teacher_id', $teacher->id)
                    ->where('subject_id', $grade->subject_id)
                    ->where('section_id', $grade->section_id)
                    ->exists() ||
                Schedule::where('teacher_id', $teacher->id)
                    ->where('subject_id', $grade->subject_id)
                    ->where('section_id', $grade->section_id)
                    ->exists();

            if (!$isAssigned) {
                return response()->json(['message' => 'Unauthorized: You can only delete grades for your assigned classes.'], 403);
            }
        }

        $grade->delete();

        return response()->json(['message' => 'Grade record deleted successfully.']);
    }
}
