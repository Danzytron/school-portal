<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class RoomResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id' => $this->id, 'name' => $this->name, 'building' => $this->building,
            'floor' => $this->floor, 'capacity' => $this->capacity,
            'type' => $this->type, 'is_active' => $this->is_active
        ];
    }
}
