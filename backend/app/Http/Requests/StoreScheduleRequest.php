<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StoreScheduleRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'subject_id' => 'required|exists:subjects,id',
            'section_id' => 'required|exists:sections,id',
            'teacher_id' => 'required|exists:teachers,id',
            'room_id' => 'required|exists:rooms,id',
            'semester_id' => 'required|exists:semesters,id',
            'day_of_week' => 'required|string',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time'
        ];
    }
}
