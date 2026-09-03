<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class StudentResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id' => $this->id, 'student_id_number' => $this->student_id_number,
            'user' => new UserResource($this->whenLoaded('user')),
            'course' => new CourseResource($this->whenLoaded('course')),
            'year_level' => $this->year_level,
            'section' => new SectionResource($this->whenLoaded('section')),
            'contact_number' => $this->contact_number, 'address' => $this->address,
            'date_of_birth' => $this->date_of_birth, 'enrollment_status' => $this->enrollment_status
        ];
    }
}
