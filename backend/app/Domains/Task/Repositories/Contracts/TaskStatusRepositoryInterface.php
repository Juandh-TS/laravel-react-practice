<?php

namespace App\Domains\Task\Repositories\Contracts;

use App\Domains\Task\Models\TaskStatus;
use Illuminate\Database\Eloquent\Collection;

interface TaskStatusRepositoryInterface
{
    public function listForCompany(?int $companyId): Collection;
    public function getById(int $id): ?TaskStatus;
    public function findByCompanyAndSlug(?int $companyId, string $slug): ?TaskStatus;
    public function getDefault(?int $companyId): ?TaskStatus;
    public function slugExists(?int $companyId, string $slug): bool;
    public function getMaxPosition(?int $companyId): ?int;
    public function create(array $data): TaskStatus;
    public function update(int $id, array $data): TaskStatus;
    public function delete(int $id): bool;
    public function clearDoneExcept(?int $companyId, int $exceptId): void;
}
