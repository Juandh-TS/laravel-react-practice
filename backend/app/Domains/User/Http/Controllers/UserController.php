<?php

namespace App\Domains\User\Http\Controllers;

use App\Domains\User\Http\Requests\StoreUserRequest;
use App\Domains\User\Http\Requests\UpdateUserRequest;
use App\Domains\User\Http\Resources\UserResource;
use App\Domains\User\Repositories\Contracts\UserRepositoryInterface;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    protected $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return UserResource::collection($this->userRepository->getAll());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $user = $this->userRepository->create($request->validated());
        $user->load('company');

        return (new UserResource($user))->response()->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        return new UserResource($this->userRepository->getById($id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, int $id)
    {
        return new UserResource($this->userRepository->update($id, $request->validated()));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id)
    {
        $this->userRepository->delete($id);

        return response()->noContent();
    }

    /**
     * Toggle the active status of the specified resource.
     */
    public function toggleActive(int $id)
    {
        return new UserResource($this->userRepository->toggleActive($id));
    }
}
