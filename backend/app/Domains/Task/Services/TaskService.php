<?php

namespace App\Domains\Task\Services;

use App\Domains\Task\Models\Task;
use App\Domains\Task\Repositories\Contracts\TaskRepositoryInterface;
use App\Domains\Task\Repositories\Contracts\TaskStatusRepositoryInterface;
use App\Domains\User\Models\User;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TaskService
{
    public function __construct(
        protected TaskRepositoryInterface $taskRepository,
        protected TaskStatusRepositoryInterface $taskStatusRepository,
    ) {}

    public function listTasks(User $user, ?string $filter = null)
    {
        return $this->taskRepository->getAllForUser($user, $filter);
    }

    public function getTask(User $user, int $id)
    {
        return $this->authorizedTask($user, $id);
    }

    public function createTask(User $authUser, array $data): Task
    {
        $tagIds = $data['tag_ids'] ?? null;
        unset($data['tag_ids']);
        $data['company_id'] = $authUser->company_id;

        if (empty($data['status'])) {
            $data['status'] = $this->taskStatusRepository->getDefault($authUser->company_id)?->slug ?? 'todo';
        }

        $data['position'] = ($this->taskRepository->getMaxPosition($data['status']) ?? 0) + 1000;
        $data['completed'] = $this->resolveCompleted($authUser->company_id, $data['status']);

        if ($authUser->isAdmin() && !empty($data['user_id']) && $data['user_id'] != $authUser->id) {
            $data['assigned_by_user_id'] = $authUser->id;
            $data['assigned_at'] = now();
        } else {
            $data['user_id'] = $authUser->id;
        }

        $task = $this->taskRepository->create($data);

        if ($tagIds !== null) {
            $this->taskRepository->syncTags($task, $tagIds);
        }

        return $task->load(['user:id,name', 'assignedBy:id,name', 'tags']);
    }

    public function updateTask(User $user, int $id, array $data): Task
    {
        $task = $this->authorizedTask($user, $id);

        // Regla: No se puede editar si fue asignada por un admin y el usuario actual no es admin
        if ($task->assigned_by_user_id && $task->assigned_by_user_id !== $user->id && !$user->isAdmin()) {

            // Solo se modifica el estado cuando es asignada por un admin
            if (array_key_exists('title', $data)) {   
                abort(403, "No se puede editar una tarea asignada por un administrador");
            }
        }

        if (array_key_exists('user_id', $data)) {
            abort_unless($user->isAdmin(), 403, "Solo un administrador puede reasignar una tarea");

            if ($data['user_id'] != $task->user_id) {
                $data['assigned_by_user_id'] = $user->id;
                $data['assigned_at'] = now();
            }
        }

        if (array_key_exists('status', $data)) {
            if ($data['status'] !== $task->status && !array_key_exists('position', $data)) {
                $data['position'] = ($this->taskRepository->getMaxPosition($data['status']) ?? 0) + 1000;
            }

            $data['completed'] = $this->resolveCompleted($task->company_id, $data['status']);
        }

        $tagIds = $data['tag_ids'] ?? null;
        unset($data['tag_ids']);

        $task = $this->taskRepository->update($id, $data);

        if ($tagIds !== null) {
            $this->taskRepository->syncTags($task, $tagIds);
        }

        return $task->load(['user:id,name', 'assignedBy:id,name', 'tags']);
    }



    public function deleteTask(User $user, int $id): void
    {
        $task = $this->authorizedTask($user, $id);

        // Regla de eliminación: no se puede eliminar si fue asignada por otro administrador y el usuario actual no es admin
        if ($task->assigned_by_user_id && $task->assigned_by_user_id !== $user->id && !$user->isAdmin()) {
            abort(403, "No se puede eliminar una tarea asignada por un administrador");
        }

        $this->taskRepository->delete($id);
    }

    /**
     * `completed` es un booleano legado que otros consumidores (ej. el
     * snapshot del chatbot) siguen leyendo; se deriva del flag `is_done`
     * del estado admin-configurable en vez de un slug hardcodeado.
     */
    protected function resolveCompleted(?int $companyId, string $statusSlug): bool
    {
        $status = $this->taskStatusRepository->findByCompanyAndSlug($companyId, $statusSlug);

        return $status?->is_done ?? ($statusSlug === 'done');
    }

    public function authorizedTask(User $user, int $id): Task
    {
        $task = $this->taskRepository->getById($id);

        if (!$task) {
            throw new NotFoundHttpException("Task not found");
        }

        $sameCompany = $task->company_id && $task->company_id == $user->company_id;

        abort_unless(
            $task->user_id === $user->id ||
            $task->assigned_by_user_id === $user->id ||
            $user->isAdmin() ||
            403,
            "No autorizado para acceder a esta tarea"
        );

        return $task;
    }
}