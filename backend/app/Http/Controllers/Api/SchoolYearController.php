<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolYear;
use Illuminate\Http\Request;

class SchoolYearController extends Controller {
    public function index(Request $request) {
        return response()->json(SchoolYear::orderBy('year_start', 'desc')->get());
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'year_start' => 'required|integer',
            'year_end' => 'required|integer',
        ]);
        $sy = SchoolYear::create($validated);
        return response()->json($sy, 201);
    }

    public function show($id) {
        return response()->json(SchoolYear::findOrFail($id));
    }

    public function update(Request $request, $id) {
        $sy = SchoolYear::findOrFail($id);
        if ($request->has('is_current') && $request->is_current) {
            SchoolYear::query()->update(['is_current' => false]);
        }
        $sy->update($request->only(['year_start', 'year_end', 'is_current']));
        return response()->json($sy);
    }

    public function destroy($id) {
        SchoolYear::findOrFail($id)->delete();
        return response()->json(['message' => 'School year deleted']);
    }
}
