<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class EnrollmentResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'student' => new StudentResource($this->whenLoaded('student')),
            'semester' => new SemesterResource($this->whenLoaded('semester')),
            'status' => $this->status, 'enrolled_at' => $this->enrolled_at,
            'remarks' => $this->remarks,
            'subjects' => EnrollmentSubjectResource::collection($this->whenLoaded('subjects'))
        ];
    }
}
