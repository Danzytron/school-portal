<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class SectionResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id' => $this->id, 'name' => $this->name,
            'course' => new CourseResource($this->whenLoaded('course')),
            'year_level' => $this->year_level,
            'school_year' => new SchoolYearResource($this->whenLoaded('school_year')),
            'max_students' => $this->max_students, 'is_active' => $this->is_active
        ];
    }
}
