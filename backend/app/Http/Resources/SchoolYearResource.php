<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class SchoolYearResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id' => $this->id, 'year_start' => $this->year_start,
            'year_end' => $this->year_end, 'is_current' => $this->is_current
        ];
    }
}
