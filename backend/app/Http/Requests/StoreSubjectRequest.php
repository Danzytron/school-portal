<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StoreSubjectRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'code' => 'required|string|unique:subjects',
            'name' => 'required|string',
            'units' => 'required|integer',
            'course_id' => 'required|exists:courses,id',
            'year_level' => 'required|integer',
            'semester' => 'required|integer'
        ];
    }
}
