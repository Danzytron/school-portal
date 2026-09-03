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
            'teacher_id' => 'nullable|exists:teachers,id',
            'midterm' => 'nullable|numeric',
            'final' => 'nullable|numeric',
            'remarks' => 'nullable|string',
        ]);

        $teacher = $request->user()->teacher;
        if ($teacher) {
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
        $query = Grade::with(['student.user', 'subject']);
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
        $grade->update($request->only(['midterm', 'final', 'final_grade', 'remarks', 'is_submitted']));
        return response()->json($grade);
    }

    public function submitFinal(Request $request)
    {
        if ($request->has('subject_id') && $request->has('section_id')) {
            Grade::where('subject_id', $request->subject_id)
                ->where('section_id', $request->section_id)
                ->update(['is_submitted' => true, 'submitted_at' => now()]);
        }
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
