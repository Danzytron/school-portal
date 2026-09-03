<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StoreTeacherRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'employee_id' => 'required|string|unique:teachers',
            'department' => 'required|string',
            'specialization' => 'required|string',
            'contact_number' => 'nullable|string'
        ];
    }
}
