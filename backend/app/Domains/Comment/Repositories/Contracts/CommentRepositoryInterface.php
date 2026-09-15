<?php

namespace App\Domains\Comment\Repositories\Contracts;

interface CommentRepositoryInterface
{
    public function getAllForTask(int $taskId);
    public function getById(int $id);
    public function create(array $data);
    public function delete(int $id): void;
}
