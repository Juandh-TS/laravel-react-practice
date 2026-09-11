<?php

namespace App\Domains\Task\Repositories\Eloquent;

use App\Domains\Task\Models\Task;
use App\Domains\Task\Repositories\Contracts\TaskRepositoryInterface;

class TaskRepository implements TaskRepositoryInterface
{

    protected $task;

    public function __construct(Task $task)
    {
        $this->task = $task;
    }

    public function getAll()
    {
        return $this->task->latest()->get();
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