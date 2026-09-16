<?php

namespace App\Domains\Task\Repositories\Eloquent;

use App\Domains\Task\Models\TaskPriority;
use App\Domains\Task\Repositories\Contracts\TaskPriorityRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class TaskPriorityRepository implements TaskPriorityRepositoryInterface
{
    public function __construct(protected TaskPriority $taskPriority) {}

    public function listForCompany(?int $companyId): Collection
    {
        return $this->taskPriority->query()
            ->where('company_id', $companyId)
            ->orderBy('position')
            ->get();
    }

    public function getById(int $id): ?TaskPriority
    {
        return $this->taskPriority->find($id);
    }

    public function slugExists(?int $companyId, string $slug): bool
    {
        return $this->taskPriority->query()
            ->where('company_id', $companyId)
            ->where('slug', $slug)
            ->exists();
    }

    public function getMaxPosition(?int $companyId): ?int
    {
        return $this->taskPriority->query()->where('company_id', $companyId)->max('position');
    }

    public function create(array $data): TaskPriority
    {
        return $this->taskPriority->create($data);
    }

    public function update(int $id, array $data): TaskPriority
    {
        $priority = $this->taskPriority->findOrFail($id);
        $priority->update($data);

        return $priority;
    }

    public function delete(int $id): bool
    {
        $priority = $this->getById($id);
        if (!$priority) {
            return false;
        }

        return (bool) $priority->delete();
    }
}
