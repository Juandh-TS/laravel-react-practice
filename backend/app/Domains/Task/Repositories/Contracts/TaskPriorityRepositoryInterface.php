<?php

namespace App\Domains\Task\Repositories\Contracts;

use App\Domains\Task\Models\TaskPriority;
use Illuminate\Database\Eloquent\Collection;

interface TaskPriorityRepositoryInterface
{
    public function listForCompany(?int $companyId): Collection;
    public function getById(int $id): ?TaskPriority;
    public function slugExists(?int $companyId, string $slug): bool;
    public function getMaxPosition(?int $companyId): ?int;
    public function create(array $data): TaskPriority;
    public function update(int $id, array $data): TaskPriority;
    public function delete(int $id): bool;
}
