<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;

class UserRepository implements UserRepositoryInterface
{
    protected $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function getAll()
    {
        return $this->user->with('company')->latest()->get();
    }

    public function getById(int $id)
    {
        return $this->user->with('company')->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->user->create($data);
    }

    public function update(int $id, array $data)
    {
        $user = $this->getById($id);
        $user->update($data);
        return $user->load('company');
    }

    public function delete(int $id)
    {
        $user = $this->getById($id);
        $user->delete();
        return $user;
    }
}