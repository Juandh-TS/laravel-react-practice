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

    public const STATUSES = ['todo', 'in_progress', 'done'];
    public const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

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


    /**
     * Mantiene `completed` sincronizado con `status` para no romper
     * consumidores existentes de ese booleano (ej. el snapshot del chatbot).
     */
    protected function setStatusAttribute(string $value): void
    {
        $this->attributes['status'] = $value;
        $this->attributes['completed'] = $value === 'done';
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
