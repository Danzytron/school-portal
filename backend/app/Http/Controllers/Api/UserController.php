<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller {
    public function index(Request $request) {
        $query = User::query();
        if ($request->has('search')) {
            $query->where('name', 'like', '%'.$request->search.'%')
                  ->orWhere('email', 'like', '%'.$request->search.'%');
        }
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }
        return response()->json($query->paginate($request->get('per_page', 15)));
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,teacher,student',
        ]);
        $validated['password'] = Hash::make($validated['password']);
        $user = User::create($validated);
        return response()->json($user, 201);
    }

    public function show($id) {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, $id) {
        $user = User::findOrFail($id);
        $data = $request->only(['name', 'email', 'role', 'is_active']);
        if ($request->has('password') && $request->password) {
            $data['password'] = Hash::make($request->password);
        }
        $user->update($data);
        return response()->json($user);
    }

    public function destroy($id) {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
