<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StoreAttendanceRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'subject_id' => 'required|exists:subjects,id',
            'section_id' => 'required|exists:sections,id',
            'date' => 'required|date',
            'records' => 'required|array',
            'records.*.student_id' => 'required|exists:students,id',
            'records.*.status' => 'required|in:present,late,absent,excused'
        ];
    }
}
