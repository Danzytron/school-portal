<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class UpdateStudentRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$this->route('student'),
            'password' => 'nullable|string|min:8',
            'student_id_number' => 'sometimes|string|unique:students,student_id_number,'.$this->route('student'),
            'course_id' => 'sometimes|exists:courses,id',
            'year_level' => 'sometimes|integer|min:1|max:6',
            'section_id' => 'nullable|exists:sections,id',
            'contact_number' => 'nullable|string',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date'
        ];
    }
}
