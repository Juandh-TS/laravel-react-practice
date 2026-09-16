<?php

namespace App\Domains\Task\Repositories\Eloquent;

use App\Domains\Task\Models\TaskStatus;
use App\Domains\Task\Repositories\Contracts\TaskStatusRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class TaskStatusRepository implements TaskStatusRepositoryInterface
{
    public function __construct(protected TaskStatus $taskStatus) {}

    public function listForCompany(?int $companyId): Collection
    {
        return $this->taskStatus->query()
            ->where('company_id', $companyId)
            ->orderBy('position')
            ->get();
    }

    public function getById(int $id): ?TaskStatus
    {
        return $this->taskStatus->find($id);
    }

    public function findByCompanyAndSlug(?int $companyId, string $slug): ?TaskStatus
    {
        return $this->taskStatus->query()
            ->where('company_id', $companyId)
            ->where('slug', $slug)
            ->first();
    }

    public function getDefault(?int $companyId): ?TaskStatus
    {
        return $this->taskStatus->query()
            ->where('company_id', $companyId)
            ->orderBy('position')
            ->first();
    }

    public function slugExists(?int $companyId, string $slug): bool
    {
        return $this->taskStatus->query()
            ->where('company_id', $companyId)
            ->where('slug', $slug)
            ->exists();
    }

    public function getMaxPosition(?int $companyId): ?int
    {
        return $this->taskStatus->query()->where('company_id', $companyId)->max('position');
    }

    public function create(array $data): TaskStatus
    {
        return $this->taskStatus->create($data);
    }

    public function update(int $id, array $data): TaskStatus
    {
        $status = $this->taskStatus->findOrFail($id);
        $status->update($data);

        return $status;
    }

    public function delete(int $id): bool
    {
        $status = $this->getById($id);
        if (!$status) {
            return false;
        }

        return (bool) $status->delete();
    }

    public function clearDoneExcept(?int $companyId, int $exceptId): void
    {
        $this->taskStatus->query()
            ->where('company_id', $companyId)
            ->where('id', '!=', $exceptId)
            ->update(['is_done' => false]);
    }
}
