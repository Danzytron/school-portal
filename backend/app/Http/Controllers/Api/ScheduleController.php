<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;

class ScheduleController extends Controller {
    public function index(Request $request) {
        $query = Schedule::with(['subject', 'section', 'teacher.user', 'room']);
        if ($request->has('section_id') && $request->section_id) {
            $query->where('section_id', $request->section_id);
        }
        return response()->json($query->paginate($request->get('per_page', 15)));
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'section_id' => 'required|exists:sections,id',
            'teacher_id' => 'required|exists:teachers,id',
            'room_id' => 'required|exists:rooms,id',
            'day_of_week' => 'required|string',
            'start_time' => 'required',
            'end_time' => 'required',
        ]);
        $validated['semester_id'] = 1;
        $schedule = Schedule::create($validated);
        return response()->json($schedule->load(['subject', 'section', 'teacher.user', 'room']), 201);
    }

    public function show($id) {
        $schedule = Schedule::with(['subject', 'section', 'teacher.user', 'room'])->findOrFail($id);
        return response()->json($schedule);
    }

    public function update(Request $request, $id) {
        $schedule = Schedule::findOrFail($id);
        $schedule->update($request->only(['subject_id', 'section_id', 'teacher_id', 'room_id', 'day_of_week', 'start_time', 'end_time']));
        return response()->json($schedule->load(['subject', 'section', 'teacher.user', 'room']));
    }

    public function destroy($id) {
        $schedule = Schedule::findOrFail($id);
        $schedule->delete();
        return response()->json(['message' => 'Schedule deleted successfully']);
    }
}
