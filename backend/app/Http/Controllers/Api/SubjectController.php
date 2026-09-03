<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller {
    public function index(Request $request) {
        $query = Subject::with('course');
        if ($request->has('search')) {
            $query->where('name', 'like', '%'.$request->search.'%')
                  ->orWhere('code', 'like', '%'.$request->search.'%');
        }
        if ($request->has('course_id') && $request->course_id) {
            $query->where('course_id', $request->course_id);
        }
        if ($request->has('year_level') && $request->year_level) {
            $query->where('year_level', $request->year_level);
        }
        return response()->json($query->paginate($request->get('per_page', 15)));
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'code' => 'required|string|unique:subjects',
            'name' => 'required|string',
            'units' => 'required|integer|min:1',
            'course_id' => 'required|exists:courses,id',
            'year_level' => 'nullable|integer',
            'semester' => 'nullable|integer',
        ]);
        $subject = Subject::create($validated);
        return response()->json($subject->load('course'), 201);
    }

    public function show($id) {
        $subject = Subject::with('course')->findOrFail($id);
        return response()->json($subject);
    }

    public function update(Request $request, $id) {
        $subject = Subject::findOrFail($id);
        $subject->update($request->only(['code', 'name', 'units', 'course_id', 'year_level', 'semester', 'is_active']));
        return response()->json($subject->load('course'));
    }

    public function destroy($id) {
        $subject = Subject::findOrFail($id);
        $subject->delete();
        return response()->json(['message' => 'Subject deleted successfully']);
    }
}
