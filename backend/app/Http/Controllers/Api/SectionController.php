<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Section;
use Illuminate\Http\Request;

class SectionController extends Controller {
    public function index(Request $request) {
        $query = Section::with('course');
        if ($request->has('search')) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }
        if ($request->has('course_id') && $request->course_id) {
            $query->where('course_id', $request->course_id);
        }
        return response()->json($query->paginate($request->get('per_page', 15)));
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string',
            'course_id' => 'required|exists:courses,id',
            'year_level' => 'required|integer',
            'school_year_id' => 'nullable|exists:school_years,id',
            'max_students' => 'nullable|integer',
        ]);
        $validated['school_year_id'] = $validated['school_year_id'] ?? 1;
        $section = Section::create($validated);
        return response()->json($section->load('course'), 201);
    }

    public function show($id) {
        $section = Section::with('course')->findOrFail($id);
        return response()->json($section);
    }

    public function update(Request $request, $id) {
        $section = Section::findOrFail($id);
        $section->update($request->only(['name', 'course_id', 'year_level', 'max_students', 'is_active']));
        return response()->json($section->load('course'));
    }

    public function destroy($id) {
        $section = Section::findOrFail($id);
        $section->delete();
        return response()->json(['message' => 'Section deleted successfully']);
    }
}
