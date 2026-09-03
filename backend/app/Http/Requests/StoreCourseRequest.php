<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StoreCourseRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'code' => 'required|string|unique:courses',
            'name' => 'required|string',
            'department' => 'required|string',
            'duration_years' => 'required|integer'
        ];
    }
}
