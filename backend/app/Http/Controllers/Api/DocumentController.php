<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Http\Resources\DocumentResource;
use Illuminate\Http\Request;

class DocumentController extends Controller {
    public function index(Request $request) {
        $query = Document::query()->with(['subject']);
        if ($request->has('search')) {
            $query->where('title', 'like', '%'.$request->search.'%');
        }
        $items = $query->paginate($request->get('per_page', 15));
        return response()->json($items);
    }

    public function teacherIndex(Request $request) {
        $user = $request->user();
        $docs = Document::where('uploaded_by', $user->id)->with(['subject'])->get();
        return response()->json($docs);
    }

    public function store(Request $request) {
        $request->validate([
            'title' => 'required|string',
            'subject_id' => 'nullable|exists:subjects,id',
            'description' => 'nullable|string',
        ]);

        $item = Document::create([
            'title' => $request->title,
            'description' => $request->description,
            'subject_id' => $request->subject_id,
            'uploaded_by' => $request->user()->id,
            'file_path' => 'documents/sample.pdf',
            'file_type' => 'application/pdf',
            'file_size' => 1024576,
        ]);

        return response()->json($item, 201);
    }

    public function show($id) {
        $item = Document::with(['subject'])->findOrFail($id);
        return response()->json($item);
    }

    public function update(Request $request, $id) {
        $item = Document::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id) {
        $item = Document::findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
