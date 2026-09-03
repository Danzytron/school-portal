<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StoreDocumentRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'title' => 'required|string',
            'description' => 'nullable|string',
            'file' => 'required|file',
            'subject_id' => 'nullable|exists:subjects,id'
        ];
    }
}
