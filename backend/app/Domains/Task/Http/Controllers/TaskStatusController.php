<?php

namespace App\Domains\Task\Http\Controllers;

use App\Domains\Task\Http\Requests\StoreTaskStatusRequest;
use App\Domains\Task\Http\Requests\UpdateTaskStatusRequest;
use App\Domains\Task\Http\Resources\TaskStatusResource;
use App\Domains\Task\Services\TaskStatusService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Task statuses', description: 'Admin-managed task status board columns')]
class TaskStatusController extends Controller
{
    public function __construct(protected TaskStatusService $taskStatusService) {}

    public function index(Request $request)
    {
        return TaskStatusResource::collection($this->taskStatusService->list($request->user()));
    }

    public function store(StoreTaskStatusRequest $request)
    {
        $status = $this->taskStatusService->create($request->user(), $request->validated());

        return (new TaskStatusResource($status))->response()->setStatusCode(201);
    }

    public function update(UpdateTaskStatusRequest $request, int $id)
    {
        $status = $this->taskStatusService->update($request->user(), $id, $request->validated());

        return new TaskStatusResource($status);
    }

    public function destroy(Request $request, int $id)
    {
        $this->taskStatusService->delete($request->user(), $id);

        return response()->noContent();
    }
}
