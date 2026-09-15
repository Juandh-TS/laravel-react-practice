<?php

namespace App\Domains\Comment\Repositories\Eloquent;

use App\Domains\Comment\Models\Comment;
use App\Domains\Comment\Repositories\Contracts\CommentRepositoryInterface;

class CommentRepository implements CommentRepositoryInterface
{
    public function __construct(protected Comment $comment) {}

    public function getAllForTask(int $taskId)
    {
        return $this->comment->query()
            ->with('user:id,name')
            ->where('task_id', $taskId)
            ->oldest()
            ->get();
    }

    public function getById(int $id)
    {
        return $this->comment->with('user:id,name')->find($id);
    }

    public function create(array $data)
    {
        $comment = $this->comment->create($data);

        return $comment->load('user:id,name');
    }

    public function delete(int $id): void
    {
        $this->comment->find($id)?->delete();
    }
}
