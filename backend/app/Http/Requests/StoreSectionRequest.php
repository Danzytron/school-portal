<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StoreSectionRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'name' => 'required|string',
            'course_id' => 'required|exists:courses,id',
            'year_level' => 'required|integer',
            'school_year_id' => 'required|exists:school_years,id',
            'max_students' => 'required|integer'
        ];
    }
}
