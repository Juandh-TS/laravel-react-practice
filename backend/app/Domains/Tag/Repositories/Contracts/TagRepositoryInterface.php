<?php

namespace App\Domains\Tag\Repositories\Contracts;

use App\Domains\Tag\Models\Tag;
use App\Domains\User\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface TagRepositoryInterface
{
    public function getForUser(User $user): Collection;
    public function getById(int $id): ?Tag;
    public function firstOrCreate(array $attributes, array $values = []): Tag;
    public function delete(int $id): bool;
}
