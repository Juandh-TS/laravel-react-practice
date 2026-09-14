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
        security: [['sanctum' => []]],
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
    #[OA\Post(
        path: '/api/users',
        tags: ['Users'],
        summary: 'Create a new user',
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 201, description: 'User created'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
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
        security: [['sanctum' => []]],
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
    #[OA\Put(
        path: '/api/users/{id}',
        tags: ['Users'],
        summary: 'Update a user',
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'User updated'),
            new OA\Response(response: 404, description: 'User not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateUserRequest $request, int $id)
    {
        return new UserResource($this->userRepository->update($id, $request->validated()));
    }

    /**
     * Remove the specified resource from storage.
     */
    #[OA\Delete(
        path: '/api/users/{id}',
        tags: ['Users'],
        summary: 'Delete a user',
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 204, description: 'User deleted'),
            new OA\Response(response: 404, description: 'User not found'),
        ]
    )]
    public function destroy(int $id)
    {
        $this->userRepository->delete($id);

        return response()->noContent();
    }

    /**
     * Toggle the active status of the specified resource.
     */
    #[OA\Patch(
        path: '/api/users/{id}/toggle-active',
        tags: ['Users'],
        summary: 'Toggle a user\'s active status',
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'User status toggled'),
            new OA\Response(response: 404, description: 'User not found'),
        ]
    )]
    public function toggleActive(int $id)
    {
        return new UserResource($this->userRepository->toggleActive($id));
    }
}
