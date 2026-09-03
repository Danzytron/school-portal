<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TeacherService;
use Illuminate\Http\Request;
use App\Models\Teacher;
use App\Models\TeacherSubject;
use App\Models\Student;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TeacherController extends Controller
{
    protected $teacherService;

    public function __construct(TeacherService $teacherService)
    {
        $this->teacherService = $teacherService;
    }

    public function index(Request $request)
    {
        $query = Teacher::with('user');
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
            })->orWhere('employee_id', 'like', "%{$search}%");
        }
        return response()->json($query->paginate($request->get('per_page', 15)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'employee_id' => 'required|string|unique:teachers',
            'department' => 'nullable|string',
            'specialization' => 'nullable|string',
            'contact_number' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make('Portal2025!'),
            'role' => 'teacher',
        ]);

        $teacher = Teacher::create([
            'user_id' => $user->id,
            'employee_id' => $validated['employee_id'],
            'department' => $validated['department'] ?? 'General',
            'specialization' => $validated['specialization'] ?? null,
            'contact_number' => $validated['contact_number'] ?? null,
        ]);

        return response()->json($teacher->load('user'), 201);
    }

    public function show($id)
    {
        $teacher = Teacher::with('user')->findOrFail($id);
        return response()->json($teacher);
    }

    public function update(Request $request, $id)
    {
        $teacher = Teacher::findOrFail($id);
        if ($request->has('name')) {
            $teacher->user->update(['name' => $request->name]);
        }
        if ($request->has('email')) {
            $teacher->user->update(['email' => $request->email]);
        }
        $teacher->update($request->only(['department', 'specialization', 'contact_number']));
        return response()->json($teacher->load('user'));
    }

    public function destroy($id)
    {
        $teacher = Teacher::findOrFail($id);
        $teacher->user()->delete();
        $teacher->delete();
        return response()->json(['message' => 'Teacher deleted successfully']);
    }

    public function profile(Request $request)
    {
        $teacher = $request->user()->teacher;
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile not found'], 404);
        }
        return response()->json($teacher->load('user'));
    }

    public function updateProfile(Request $request)
    {
        $teacher = $request->user()->teacher;
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile not found'], 404);
        }
        $teacher->update($request->only(['contact_number', 'specialization']));
        return response()->json($teacher->load('user'));
    }

    public function subjects(Request $request)
    {
        $teacher = $request->user()->teacher;
        if (!$teacher) return response()->json([]);

        $assigned = TeacherSubject::where('teacher_id', $teacher->id)
            ->with(['subject', 'section'])
            ->get();

        return response()->json($assigned);
    }

    public function students(Request $request)
    {
        $teacher = $request->user()->teacher;
        if (!$teacher) return response()->json([]);

        $sectionIds = TeacherSubject::where('teacher_id', $teacher->id)->pluck('section_id')->unique();

        $query = Student::whereIn('section_id', $sectionIds)->with(['user', 'course', 'section']);
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        return response()->json($query->get());
    }

    public function schedule(Request $request)
    {
        $teacher = $request->user()->teacher;
        if (!$teacher) return response()->json([]);

        $schedules = Schedule::where('teacher_id', $teacher->id)
            ->with(['subject', 'section', 'room'])
            ->get();

        return response()->json($schedules);
    }
}
