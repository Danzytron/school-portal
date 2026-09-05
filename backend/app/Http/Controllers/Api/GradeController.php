<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GradeService;
use Illuminate\Http\Request;
use App\Models\Grade;

class GradeController extends Controller
{
    protected $gradeService;

    public function __construct(GradeService $gradeService)
    {
        $this->gradeService = $gradeService;
    }

    public function submit(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'section_id' => 'nullable|exists:sections,id',
            'midterm' => 'nullable|numeric|min:1|max:5',
            'final' => 'nullable|numeric|min:1|max:5',
            'remarks' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        if ($user->role === 'teacher') {
            $teacher = $user->teacher;
            if (!$teacher) {
                return response()->json(['message' => 'Teacher profile not found'], 403);
            }
            $validated['teacher_id'] = $teacher->id;
        }

        $grade = Grade::updateOrCreate(
            [
                'student_id' => $validated['student_id'],
                'subject_id' => $validated['subject_id'],
            ],
            $validated
        );

        return response()->json($grade);
    }

    public function classGrades(Request $request)
    {
        $user = $request->user();
        $query = Grade::with(['student.user', 'subject']);

        if ($user->role === 'teacher' && $user->teacher) {
            $query->where('teacher_id', $user->teacher->id);
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
        $grade = Grade::findOrFail($id);
        $user = $request->user();

        if ($user->role === 'teacher' && $user->teacher && $grade->teacher_id !== $user->teacher->id) {
            return response()->json(['message' => 'Unauthorized: You can only edit grades for your assigned classes.'], 403);
        }

        $validated = $request->validate([
            'midterm' => 'nullable|numeric|min:1|max:5',
            'final' => 'nullable|numeric|min:1|max:5',
            'final_grade' => 'nullable|numeric|min:1|max:5',
            'remarks' => 'nullable|string|max:255',
            'is_submitted' => 'nullable|boolean',
        ]);

        $grade->update($validated);
        return response()->json($grade);
    }

    public function submitFinal(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'section_id' => 'required|exists:sections,id',
        ]);

        $user = $request->user();
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
        $grade = Grade::findOrFail($id);
        $grade->update(['is_submitted' => true, 'submitted_at' => now()]);
        return response()->json($grade);
    }
}
