<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class UpdateSubjectRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'code' => 'sometimes|string|unique:subjects,code,'.$this->route('subject'),
            'name' => 'sometimes|string',
            'units' => 'sometimes|integer',
            'course_id' => 'sometimes|exists:courses,id',
            'year_level' => 'sometimes|integer',
            'semester' => 'sometimes|integer'
        ];
    }
}
