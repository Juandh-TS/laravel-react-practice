<?php

namespace App\Domains\Tag\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TagResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'color' => $this->color ?? '#6366f1',
            'company_id' => $this->company_id,
            'created_at' => $this->created_at,
        ];
    }
}
