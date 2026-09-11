<?php

namespace App\Domains\Task\Models;

use App\Domains\Company\Models\Company;
use App\Domains\User\Models\User;
use Database\Factories\TaskFactory;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[UseFactory(TaskFactory::class)]
class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['title', 'completed', 'user_id', 'company_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    protected function casts(): array
    {
        return [
            'completed' => 'boolean',
        ];
    }
}
