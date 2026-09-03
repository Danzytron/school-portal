<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class UpdateTeacherRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$this->route('teacher'),
            'password' => 'nullable|string|min:8',
            'employee_id' => 'sometimes|string|unique:teachers,employee_id,'.$this->route('teacher'),
            'department' => 'sometimes|string',
            'specialization' => 'sometimes|string',
            'contact_number' => 'nullable|string'
        ];
    }
}
