<?php

namespace App\Domains\Task\Repositories\Eloquent;

use App\Domains\Task\Models\Task;
use App\Domains\Task\Repositories\Contracts\TaskRepositoryInterface;
use App\Domains\User\Models\User;
use Illuminate\Database\Eloquent\Collection;

class TaskRepository implements TaskRepositoryInterface
{
    public function __construct(protected Task $task) {}

    public function getAllForUser(User $user, ?string $filter = null): Collection
    {
        $query = $this->task->query()
            ->with(['user:id,name', 'assignedBy:id,name', 'tags'])
            ->withCount('comments');

        if ($filter === 'assigned_to_me') {
            $query->where('user_id', $user->id);
        } elseif ($filter === 'assigned_by_me') {
            $query->where('assigned_by_user_id', $user->id)
                ->where('user_id', '!=', $user->id);
        } else {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhere('assigned_by_user_id', $user->id);

                if ($user->isAdmin() && $user->company_id) {
                    $q->orWhere('company_id', $user->company_id);
                }
            });
        }

        return $query->orderBy('position')->latest()->get();
    }

    public function getById(int $id): ?Task
    {
        return $this->task->with(['user:id,name', 'assignedBy:id,name', 'tags'])
            ->withCount('comments')
            ->find($id);
    }

    public function create(array $data): Task
    {
        return $this->task->create($data);
    }

    public function update(int $id, array $data): Task
    {
        $task = $this->task->findOrFail($id);
        $task->update($data);

        return $task;
    }

    public function delete(int $id): bool
    {
        $task = $this->task->find($id);
        if (!$task) {
            return false;
        }

        return (bool) $task->delete();
    }

    public function syncTags(Task $task, array $tagIds): void
    {
        $task->tags()->sync($tagIds);
    }

    public function getMaxPosition(string $status): ?float
    {
        return $this->task->where('status', $status)->max('position');
    }
}