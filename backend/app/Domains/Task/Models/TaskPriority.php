<?php

namespace App\Domains\Task\Models;

use App\Domains\Company\Models\Company;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskPriority extends Model
{
    protected $fillable = [
        'company_id',
        'slug',
        'label',
        'color',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
