<?php

namespace App\Domains\Task\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskStatusResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'label' => $this->label,
            'color' => $this->color ?? '#64748b',
            'position' => $this->position,
            'is_done' => $this->is_done,
        ];
    }
}
