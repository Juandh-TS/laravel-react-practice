<?php

namespace App\Domains\Task\Repositories\Contracts;

use App\Domains\User\Models\User;

interface TaskRepositoryInterface
{
    public function getAllForUser(User $user, ?string $filter = null);
    public function getById(int $id);
    public function create(array $data);
    public function update(int $id, array $data);
    public function delete(int $id);
}