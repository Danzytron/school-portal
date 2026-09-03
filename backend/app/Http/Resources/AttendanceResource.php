<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class AttendanceResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'subject' => new SubjectResource($this->whenLoaded('subject')),
            'section' => new SectionResource($this->whenLoaded('section')),
            'teacher' => new TeacherResource($this->whenLoaded('teacher')),
            'date' => $this->date,
            'records' => AttendanceRecordResource::collection($this->whenLoaded('records'))
        ];
    }
}
