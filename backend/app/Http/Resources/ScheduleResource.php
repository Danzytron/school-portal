<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class ScheduleResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'subject' => new SubjectResource($this->whenLoaded('subject')),
            'section' => new SectionResource($this->whenLoaded('section')),
            'teacher' => new TeacherResource($this->whenLoaded('teacher')),
            'room' => new RoomResource($this->whenLoaded('room')),
            'day_of_week' => $this->day_of_week, 'start_time' => $this->start_time,
            'end_time' => $this->end_time
        ];
    }
}
