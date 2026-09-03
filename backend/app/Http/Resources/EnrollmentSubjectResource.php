<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class EnrollmentSubjectResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'subject' => new SubjectResource($this->whenLoaded('subject')),
            'section' => new SectionResource($this->whenLoaded('section')),
            'schedule' => new ScheduleResource($this->whenLoaded('schedule'))
        ];
    }
}
