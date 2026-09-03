<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class TeacherResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id' => $this->id, 'employee_id' => $this->employee_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'department' => $this->department, 'specialization' => $this->specialization,
            'contact_number' => $this->contact_number
        ];
    }
}
