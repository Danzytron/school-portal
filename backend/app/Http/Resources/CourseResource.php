<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class CourseResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id' => $this->id, 'code' => $this->code, 'name' => $this->name,
            'department' => $this->department, 'description' => $this->description,
            'duration_years' => $this->duration_years, 'is_active' => $this->is_active
        ];
    }
}
