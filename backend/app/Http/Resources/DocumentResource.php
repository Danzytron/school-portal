<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class DocumentResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id' => $this->id, 'title' => $this->title, 'description' => $this->description,
            'file_path' => $this->file_path, 'file_type' => $this->file_type,
            'file_size' => $this->file_size,
            'subject' => new SubjectResource($this->whenLoaded('subject')),
            'created_at' => $this->created_at
        ];
    }
}
