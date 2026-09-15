<?php

namespace App\Domains\Task\Http\Resources;

use App\Domains\Tag\Http\Resources\TagResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'completed' => $this->completed,
            'status' => $this->status,
            'priority' => $this->priority ?? 'medium',
            'position' => $this->position,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'comments_count' => $this->whenCounted('comments'),
            'user_id' => $this->user_id,
            'company_id' => $this->company_id,
            'assigned_by_user_id' => $this->assigned_by_user_id,
            'assigned_at' => $this->assigned_at,
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'user' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ] : null),
            'assigned_by' => $this->whenLoaded('assignedBy', fn () => $this->assignedBy ? [
                'id' => $this->assignedBy->id,
                'name' => $this->assignedBy->name,
            ] : null),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

