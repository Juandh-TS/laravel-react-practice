<?php

namespace App\Domains\Task\Models;

use App\Domains\Company\Models\Company;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskStatus extends Model
{
    protected $fillable = [
        'company_id',
        'slug',
        'label',
        'color',
        'position',
        'is_done',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'is_done' => 'boolean',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
