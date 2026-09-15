<?php

namespace App\Domains\Task\Http\Controllers;

use App\Domains\Task\Http\Requests\StoreTaskRequest;
use App\Domains\Task\Http\Requests\UpdateTaskRequest;
use App\Domains\Task\Http\Resources\TaskResource;
use App\Domains\Task\Services\TaskService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Tasks', description: 'Task management endpoints')]
class TaskController extends Controller
{
    public function __construct(protected TaskService $taskService) {}
    
    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: '/api/tasks',
        tags: ['Tasks'],
        summary: 'List tasks for the authenticated user',
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'filter', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation'),
        ]
    )]
    public function index(Request $request)
    {
        $tasks = $this->taskService->listTasks($request->user(), $request->query('filter'));

        return TaskResource::collection($tasks);
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: '/api/tasks',
        tags: ['Tasks'],
        summary: 'Create a new task',
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 201, description: 'Task created'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreTaskRequest $request)
    {
        $task = $this->taskService->createTask($request->user(), $request->validated());

        return (new TaskResource($task))->response()->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: '/api/tasks/{id}',
        tags: ['Tasks'],
        summary: 'Get a single task',
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation'),
            new OA\Response(response: 403, description: 'Not authorized to view this task'),
            new OA\Response(response: 404, description: 'Task not found'),
        ]
    )]
    public function show(Request $request, int $id)
    {
        return new TaskResource($this->taskService->getTask($request->user(), $id));
    }

    /**
     * Update the specified resource in storage.
     */
    #[OA\Put(
        path: '/api/tasks/{id}',
        tags: ['Tasks'],
        summary: 'Update a task',
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Task updated'),
            new OA\Response(response: 403, description: 'Not authorized to update this task'),
            new OA\Response(response: 404, description: 'Task not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateTaskRequest $request, int $id)
    {
        $task = $this->taskService->updateTask($request->user(), $id, $request->validated());

        return new TaskResource($task);
    }

    /**
     * Remove the specified resource from storage.
     */
    #[OA\Delete(
        path: '/api/tasks/{id}',
        tags: ['Tasks'],
        summary: 'Delete a task',
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Task deleted'),
            new OA\Response(response: 403, description: 'Not authorized to delete this task'),
            new OA\Response(response: 404, description: 'Task not found'),
        ]
    )]
    public function destroy(Request $request, int $id)
    {
        $this->taskService->deleteTask($request->user(), $id);

        return response()->noContent();
    }

}
