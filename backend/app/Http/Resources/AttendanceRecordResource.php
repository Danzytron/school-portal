<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class AttendanceRecordResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'student' => new StudentResource($this->whenLoaded('student')),
            'status' => $this->status, 'time_recorded' => $this->time_recorded,
            'remarks' => $this->remarks
        ];
    }
}
