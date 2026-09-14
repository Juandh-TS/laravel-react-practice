<?php

namespace App\Domains\Task\Http\Controllers;

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
        return $this->taskRepository->getAllForUser($request->user(), $request->query('filter'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'user_id' => ['nullable', 'exists:users,id'],
        ]);

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

        return response()->json($task->load(['user:id,name', 'assignedBy:id,name']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, int $id)
    {
        return $this->authorizedTask($request, $id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id)
    {
        $this->authorizedTask($request, $id);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'completed' => ['sometimes', 'boolean'],
        ]);

        return $this->taskRepository->update($id, $validated);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, int $id)
    {
        $this->authorizedTask($request, $id);

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
