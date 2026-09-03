<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StoreGradeRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'student_id' => 'required|exists:students,id',
            'subject_id' => 'required|exists:subjects,id',
            'midterm' => 'nullable|numeric',
            'final' => 'nullable|numeric'
        ];
    }
}
