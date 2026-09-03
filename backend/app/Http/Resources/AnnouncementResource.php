<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class AnnouncementResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id' => $this->id, 'title' => $this->title, 'content' => $this->content,
            'author' => new UserResource($this->whenLoaded('author')),
            'target_audience' => $this->target_audience,
            'is_published' => $this->is_published, 'published_at' => $this->published_at,
            'created_at' => $this->created_at
        ];
    }
}
