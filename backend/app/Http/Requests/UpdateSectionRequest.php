<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class UpdateSectionRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'name' => 'sometimes|string',
            'course_id' => 'sometimes|exists:courses,id',
            'year_level' => 'sometimes|integer',
            'school_year_id' => 'sometimes|exists:school_years,id',
            'max_students' => 'sometimes|integer'
        ];
    }
}
