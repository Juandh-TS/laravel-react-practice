<?php

namespace App\Domains\Task\Http\Controllers;

use App\Domains\Task\Http\Requests\StoreTaskPriorityRequest;
use App\Domains\Task\Http\Requests\UpdateTaskPriorityRequest;
use App\Domains\Task\Http\Resources\TaskPriorityResource;
use App\Domains\Task\Services\TaskPriorityService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Task priorities', description: 'Admin-managed task priority levels')]
class TaskPriorityController extends Controller
{
    public function __construct(protected TaskPriorityService $taskPriorityService) {}

    public function index(Request $request)
    {
        return TaskPriorityResource::collection($this->taskPriorityService->list($request->user()));
    }

    public function store(StoreTaskPriorityRequest $request)
    {
        $priority = $this->taskPriorityService->create($request->user(), $request->validated());

        return (new TaskPriorityResource($priority))->response()->setStatusCode(201);
    }

    public function update(UpdateTaskPriorityRequest $request, int $id)
    {
        $priority = $this->taskPriorityService->update($request->user(), $id, $request->validated());

        return new TaskPriorityResource($priority);
    }

    public function destroy(Request $request, int $id)
    {
        $this->taskPriorityService->delete($request->user(), $id);

        return response()->noContent();
    }
}
