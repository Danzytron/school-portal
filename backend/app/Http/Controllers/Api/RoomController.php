<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller {
    public function index(Request $request) {
        $query = Room::query();
        if ($request->has('search')) {
            $query->where('name', 'like', '%'.$request->search.'%')
                  ->orWhere('building', 'like', '%'.$request->search.'%');
        }
        return response()->json($query->paginate($request->get('per_page', 15)));
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|unique:rooms',
            'building' => 'nullable|string',
            'floor' => 'nullable|string',
            'capacity' => 'nullable|integer',
            'type' => 'nullable|string',
        ]);
        $room = Room::create($validated);
        return response()->json($room, 201);
    }

    public function show($id) {
        $room = Room::findOrFail($id);
        return response()->json($room);
    }

    public function update(Request $request, $id) {
        $room = Room::findOrFail($id);
        $room->update($request->only(['name', 'building', 'floor', 'capacity', 'type', 'is_active']));
        return response()->json($room);
    }

    public function destroy($id) {
        $room = Room::findOrFail($id);
        $room->delete();
        return response()->json(['message' => 'Room deleted successfully']);
    }
}
