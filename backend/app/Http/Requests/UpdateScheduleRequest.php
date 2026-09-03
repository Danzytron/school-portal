<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class UpdateScheduleRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'subject_id' => 'sometimes|exists:subjects,id',
            'section_id' => 'sometimes|exists:sections,id',
            'teacher_id' => 'sometimes|exists:teachers,id',
            'room_id' => 'sometimes|exists:rooms,id',
            'semester_id' => 'sometimes|exists:semesters,id',
            'day_of_week' => 'sometimes|string',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i|after:start_time'
        ];
    }
}
