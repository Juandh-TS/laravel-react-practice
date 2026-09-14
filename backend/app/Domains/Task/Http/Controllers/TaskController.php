<?php

namespace App\Domains\Task\Http\Controllers;

use App\Domains\Task\Http\Requests\StoreTaskRequest;
use App\Domains\Task\Http\Requests\UpdateTaskRequest;
use App\Domains\Task\Http\Resources\TaskResource;
use App\Domains\Task\Models\Task;
use App\Domains\Task\Repositories\Contracts\TaskRepositoryInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

#[OA\Tag(name: 'Tasks', description: 'Task management endpoints')]
class TaskController extends Controller
{
    protected $taskRepository;

    public function __construct(TaskRepositoryInterface $taskRepository)
    {
        $this->taskRepository = $taskRepository;
    }
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
        $tasks = $this->taskRepository->getAllForUser($request->user(), $request->query('filter'));

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
        $validated = $request->validated();

        $validated['company_id'] = $request->user()->company_id;

        $authUser = $request->user();

        if ($authUser->isAdmin() && !empty($validated['user_id']) && $validated['user_id'] != $authUser->id) {
            $validated['assigned_by_user_id'] = $authUser->id;
            $validated['assigned_at'] = now();
        } else {
            // Si no es admin se le asgin a a el mismo
            $validated['user_id'] = $authUser->id;
        }

        $task = $this->taskRepository->create($validated);
        $task->load(['user:id,name', 'assignedBy:id,name']);

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
        return new TaskResource($this->authorizedTask($request, $id));
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
        $task = $this->authorizedTask($request, $id);
        $user = $request->user();

        // Regla de actualización: No se puede editar si fue asignada por otra persona (admin)
        if ($task->assigned_by_user_id && $task->assigned_by_user_id !== $user->id && !$user->isAdmin()) {
            abort(403, "No se puede editar una tarea asignada por un administrador");
        }

        $task = $this->taskRepository->update($id, $request->validated());
        $task->load(['user:id,name', 'assignedBy:id,name']);

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
        $task = $this->authorizedTask($request, $id);
        $user = $request->user();

        // Regla de eliminación de tarea: no se puede eliminar si fue asignada por otra persona (admin)
        if ($task->assigned_by_user_id && $task->assigned_by_user_id !== $user->id && !$user->isAdmin()) {
            abort(403, "No se puede eliminar una tarea asignada por un administrador");
        }

        $this->taskRepository->delete($id);

        return response()->noContent();
    }

    /**
     * Fetch the task by id and ensure the authenticated user may access it
     * (owner, or same company as the task).
     */
    private function authorizedTask(Request $request, int $id): Task
    {
        $task = $this->taskRepository->getById($id);

        if (! $task) {
            throw new NotFoundHttpException();
        }

        $user = $request->user();
        $sameCompany = $task->company_id && $task->company_id === $user->company_id;

        abort_unless(
            $task->user_id === $user->id ||
            $task->assigned_by_user_id === $user->id ||
            $user->isAdmin() ||
            $sameCompany,
            403
        );

        return $task;
    }
}
