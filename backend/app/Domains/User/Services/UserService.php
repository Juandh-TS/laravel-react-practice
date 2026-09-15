<?php

namespace App\Domains\User\Services;

use App\Domains\User\Models\User;
use App\Domains\User\Repositories\Contracts\UserRepositoryInterface;

class UserService
{
    public function __construct(protected UserRepositoryInterface $userRepository) {}

    public function getAll()
    {
        return $this->userRepository->getAll();
    }

    public function getById(int $id)
    {
        return $this->userRepository->getById($id);
    }

    public function create(array $data, User $user)
    {
        if (! $user->isAdmin()) {
            throw new \Exception('Unauthorized');
        }
        return $this->userRepository->create($data);
    }

    public function update(int $id, array $data, User $user)
    {   
        if (! $user->isAdmin()) {
            throw new \Exception('Unauthorized');
        }
        return $this->userRepository->update($id, $data);
    }

    public function delete(int $id, User $user)
    {
        if (! $user->isAdmin()) {
            throw new \Exception('Unauthorized');
        }
        return $this->userRepository->delete($id);
    }

    public function toggleActive(int $id, User $user)
    {   
        if (! $user->isAdmin()) {
            throw new \Exception('Unauthorized');
        }
        return $this->userRepository->toggleActive($id);
    }
}