<?php

namespace App\Domains\Task\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use SoftDeletes;

    protected $fillable = ['title', 'completed'];

    protected function casts(): array
    {
        return [
            'completed' => 'boolean',
        ];
    }
}
