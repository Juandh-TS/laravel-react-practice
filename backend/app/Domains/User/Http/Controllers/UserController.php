<?php

namespace App\Domains\User\Http\Controllers;

use App\Domains\User\Http\Requests\StoreUserRequest;
use App\Domains\User\Http\Requests\UpdateUserRequest;
use App\Domains\User\Http\Resources\UserResource;
use App\Domains\User\Repositories\Contracts\UserRepositoryInterface;
use App\Http\Controllers\Controller;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Users', description: 'User management endpoints')]
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
    #[OA\Get(
        path: '/api/users',
        tags: ['Users'],
        summary: 'List all users',
        responses: [
            new OA\Response(response: 200, description: 'Successful operation'),
        ]
    )]
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
    #[OA\Get(
        path: '/api/users/{id}',
        tags: ['Users'],
        summary: 'Get a single user',
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation'),
            new OA\Response(response: 404, description: 'User not found'),
        ]
    )]
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
