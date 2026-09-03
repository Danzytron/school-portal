<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StoreStudentRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'student_id_number' => 'required|string|unique:students',
            'course_id' => 'required|exists:courses,id',
            'year_level' => 'required|integer|min:1|max:6',
            'section_id' => 'nullable|exists:sections,id',
            'contact_number' => 'nullable|string',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date'
        ];
    }
}
