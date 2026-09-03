<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Semester;
use Illuminate\Http\Request;

class SemesterController extends Controller {
    public function index(Request $request) {
        return response()->json(Semester::with('schoolYear')->get());
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'school_year_id' => 'required|exists:school_years,id',
            'name' => 'required|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);
        $sem = Semester::create($validated);
        return response()->json($sem->load('schoolYear'), 201);
    }

    public function show($id) {
        return response()->json(Semester::with('schoolYear')->findOrFail($id));
    }

    public function update(Request $request, $id) {
        $sem = Semester::findOrFail($id);
        if ($request->has('is_current') && $request->is_current) {
            Semester::query()->update(['is_current' => false]);
        }
        $sem->update($request->only(['name', 'school_year_id', 'start_date', 'end_date', 'is_current']));
        return response()->json($sem->load('schoolYear'));
    }

    public function destroy($id) {
        Semester::findOrFail($id)->delete();
        return response()->json(['message' => 'Semester deleted']);
    }
}
