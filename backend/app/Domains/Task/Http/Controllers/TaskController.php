<?php

namespace App\Domains\Task\Http\Controllers;

use App\Domains\Task\Http\Requests\StoreTaskRequest;
use App\Domains\Task\Http\Requests\UpdateTaskRequest;
use App\Domains\Task\Http\Resources\TaskResource;
use App\Domains\Task\Models\Task;
use App\Domains\Task\Repositories\Contracts\TaskRepositoryInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

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
    public function index(Request $request)
    {
        $tasks = $this->taskRepository->getAllForUser($request->user(), $request->query('filter'));

        return TaskResource::collection($tasks);
    }

    /**
     * Store a newly created resource in storage.
     */
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
    public function show(Request $request, int $id)
    {
        return new TaskResource($this->authorizedTask($request, $id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, int $id)
    {
        $task = $this->authorizedTask($request, $id);
        $user = $request->user();

        // regla de actualizacion de tarea
        if ($task->assigned_by_user_id && $task->assigned_by_user_id !== $user->id && !$user->isAdmin()) {
            abort(403, "No se puede editar una tarea asignada por un administrador");
        }
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'completed' => ['sometimes', 'boolean'],
        ]);

        return new TaskResource($task);
    }

    /**
     * Remove the specified resource from storage.
     */
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
