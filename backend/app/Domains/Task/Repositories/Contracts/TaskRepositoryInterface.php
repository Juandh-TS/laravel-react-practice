<?php

namespace App\Domains\Task\Repositories\Contracts;

use App\Domains\Task\Models\Task;
use App\Domains\User\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface TaskRepositoryInterface
{
    public function getAllForUser(User $user, ?string $filter = null): Collection;
    public function getById(int $id): ?Task;
    public function create(array $data): Task;
    public function update(int $id, array $data): Task;
    public function delete(int $id): bool;
    public function syncTags(Task $task, array $tagIds): void;
}