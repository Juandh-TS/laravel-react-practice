<?php

namespace App\Domains\Task\Models;

use Database\Factories\TaskFactory;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[UseFactory(TaskFactory::class)]
class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['title', 'completed'];

    protected function casts(): array
    {
        return [
            'completed' => 'boolean',
        ];
    }
}
