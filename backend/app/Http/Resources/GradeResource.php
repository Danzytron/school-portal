<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class GradeResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'student' => new StudentResource($this->whenLoaded('student')),
            'subject' => new SubjectResource($this->whenLoaded('subject')),
            'midterm' => $this->midterm, 'final' => $this->final,
            'final_grade' => $this->final_grade, 'remarks' => $this->remarks,
            'is_submitted' => $this->is_submitted, 'submitted_at' => $this->submitted_at
        ];
    }
}
