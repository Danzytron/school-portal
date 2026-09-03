<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class UpdateCourseRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'code' => 'sometimes|string|unique:courses,code,'.$this->route('course'),
            'name' => 'sometimes|string',
            'department' => 'sometimes|string',
            'duration_years' => 'sometimes|integer'
        ];
    }
}
