<?php

namespace App\Domains\Task\Repositories\Eloquent;

use App\Domains\Task\Models\Task;
use App\Domains\Task\Repositories\Contracts\TaskRepositoryInterface;
use App\Domains\User\Models\User;

class TaskRepository implements TaskRepositoryInterface
{

    protected $task;

    public function __construct(Task $task)
    {
        $this->task = $task;
    }

    public function getAllForUser(User $user)
    {
        return $this->task->query()
            ->with('user:id,name')
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)->whereNull('company_id');

                if ($user->company_id) {
                    $query->orWhere('company_id', $user->company_id);
                }
            })
            ->latest()
            ->get();
    }

    public function getById(int $id)
    {
        return $this->task->find($id);
    }

    public function create(array $data)
    {
        return $this->task->create($data);
    }

    public function update(int $id, array $data)
    {
        $task = $this->task->find($id);
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