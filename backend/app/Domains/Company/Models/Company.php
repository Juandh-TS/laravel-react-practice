<?php

namespace App\Domains\Company\Models;

use App\Domains\User\Models\User;
use Database\Factories\CompanyFactory;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[UseFactory(CompanyFactory::class)]
class Company extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
