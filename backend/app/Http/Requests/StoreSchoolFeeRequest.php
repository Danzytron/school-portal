<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StoreSchoolFeeRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'student_id' => 'required|exists:students,id',
            'semester_id' => 'required|exists:semesters,id',
            'tuition' => 'required|numeric',
            'miscellaneous' => 'required|numeric',
            'laboratory' => 'required|numeric',
            'library' => 'required|numeric',
            'other_fees' => 'required|numeric'
        ];
    }
}
