<?php

namespace App\Domains\Task\Repositories\Eloquent;

use App\Domains\Task\Models\Task;
use App\Domains\Task\Repositories\Contracts\TaskRepositoryInterface;
use App\Domains\User\Models\User;

class TaskRepository implements TaskRepositoryInterface
{
    public function __construct(protected Task $task){}

    public function getAllForUser(User $user, ?string $filter = null)
    {
        $query = $this->task->query()
            ->with(['user:id,name', 'assignedBy:id,name']);

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

        return $query->latest()->get();
    }

    public function getById(int $id)
    {
        return $this->task->with(['user:id,name', 'assignedBy:id,name'])->find($id);
    }

    public function create(array $data)
    {
        return $this->task->create($data);
    }

    public function update(int $id, array $data)
    {
        $task = $this->getById($id);
        $task->update($data);
        return $task;
    }

    public function delete(int $id)
    {
        $task = $this->task->find($id);
        $task->delete();
        return $task;
    }
}