<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller {
    public function index(Request $request) {
        $query = Course::query();
        if ($request->has('search')) {
            $query->where('name', 'like', '%'.$request->search.'%')
                  ->orWhere('code', 'like', '%'.$request->search.'%');
        }
        return response()->json($query->paginate($request->get('per_page', 15)));
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'code' => 'required|string|unique:courses',
            'name' => 'required|string',
            'department' => 'nullable|string',
            'duration_years' => 'nullable|integer',
        ]);
        $course = Course::create($validated);
        return response()->json($course, 201);
    }

    public function show($id) {
        $course = Course::findOrFail($id);
        return response()->json($course);
    }

    public function update(Request $request, $id) {
        $course = Course::findOrFail($id);
        $course->update($request->only(['code', 'name', 'department', 'description', 'duration_years', 'is_active']));
        return response()->json($course);
    }

    public function destroy($id) {
        $course = Course::findOrFail($id);
        $course->delete();
        return response()->json(['message' => 'Course deleted successfully']);
    }
}
