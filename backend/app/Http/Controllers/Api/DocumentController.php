<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Http\Resources\DocumentResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DocumentController extends Controller {
    public function index(Request $request) {
        $query = Document::query()->with(['subject']);
        if ($request->has('search')) {
            $search = substr($request->search, 0, 100);
            $query->where('title', 'like', '%'.$search.'%');
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
            'title' => 'required|string|max:255',
            'subject_id' => 'nullable|exists:subjects,id',
            'description' => 'nullable|string|max:1000',
            'file' => 'nullable|file|mimes:pdf,doc,docx,txt,png,jpg,jpeg|max:10240', // Max 10MB
        ]);

        $filePath = 'documents/sample.pdf';
        $fileType = 'application/pdf';
        $fileSize = 1024576;

        if ($request->hasFile('file') && $request->file('file')->isValid()) {
            $file = $request->file('file');
            $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $filePath = $file->storeAs('documents', $fileName, 'public');
            $fileType = $file->getMimeType();
            $fileSize = $file->getSize();
        }

        $item = Document::create([
            'title' => strip_tags($request->title),
            'description' => $request->description ? strip_tags($request->description) : null,
            'subject_id' => $request->subject_id,
            'uploaded_by' => $request->user()->id,
            'file_path' => $filePath,
            'file_type' => $fileType,
            'file_size' => $fileSize,
        ]);

        return response()->json($item, 201);
    }

    public function show($id) {
        $item = Document::with(['subject'])->findOrFail($id);
        return response()->json($item);
    }

    public function update(Request $request, $id) {
        $item = Document::findOrFail($id);
        $user = $request->user();

        // Enforce ownership: only uploader or admin can update
        if ($item->uploaded_by !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'subject_id' => 'nullable|exists:subjects,id',
        ]);

        $item->update($request->only(['title', 'description', 'subject_id']));
        return response()->json($item);
    }

    public function destroy(Request $request, $id) {
        $item = Document::findOrFail($id);
        $user = $request->user();

        // Enforce ownership: only uploader or admin can delete
        if ($item->uploaded_by !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $item->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
