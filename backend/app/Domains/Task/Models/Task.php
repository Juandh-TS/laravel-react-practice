<?php

namespace App\Domains\Task\Models;

use App\Domains\Comment\Models\Comment;
use App\Domains\Company\Models\Company;
use App\Domains\Tag\Models\Tag;
use App\Domains\User\Models\User;
use Database\Factories\TaskFactory;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[UseFactory(TaskFactory::class)]
class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'completed',
        'status',
        'priority',
        'position',
        'start_date',
        'end_date',
        'user_id',
        'company_id',
        'assigned_by_user_id',
        'assigned_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class,'user_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by_user_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'tag_task');
    }


    protected function casts(): array
    {
        return [
            'completed' => 'boolean',
            'assigned_at' => 'datetime',
            'start_date' => 'date',
            'end_date' => 'date',
            'position' => 'float',
        ];
    }
}
