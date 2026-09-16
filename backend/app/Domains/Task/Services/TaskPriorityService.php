<?php

namespace App\Domains\Task\Services;

use App\Domains\Task\Models\Task;
use App\Domains\Task\Models\TaskPriority;
use App\Domains\Task\Repositories\Contracts\TaskPriorityRepositoryInterface;
use App\Domains\User\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TaskPriorityService
{
    public function __construct(protected TaskPriorityRepositoryInterface $taskPriorityRepository) {}

    public function list(User $user): Collection
    {
        return $this->taskPriorityRepository->listForCompany($user->company_id);
    }

    public function create(User $user, array $data): TaskPriority
    {
        abort_unless($user->isAdmin(), 403, 'Solo un administrador puede gestionar las prioridades.');

        $slug = Str::slug($data['label'], '_');
        abort_if(
            $this->taskPriorityRepository->slugExists($user->company_id, $slug),
            422,
            'Ya existe una prioridad con un nombre equivalente.',
        );

        $position = ($this->taskPriorityRepository->getMaxPosition($user->company_id) ?? 0) + 1;

        return $this->taskPriorityRepository->create([
            'company_id' => $user->company_id,
            'slug' => $slug,
            'label' => $data['label'],
            'color' => $data['color'] ?? '#64748b',
            'position' => $position,
        ]);
    }

    public function update(User $user, int $id, array $data): TaskPriority
    {
        abort_unless($user->isAdmin(), 403, 'Solo un administrador puede gestionar las prioridades.');

        $priority = $this->authorizedPriority($user, $id);

        return $this->taskPriorityRepository->update($priority->id, array_filter([
            'label' => $data['label'] ?? null,
            'color' => $data['color'] ?? null,
            'position' => $data['position'] ?? null,
        ], fn ($value) => $value !== null));
    }

    public function delete(User $user, int $id): void
    {
        abort_unless($user->isAdmin(), 403, 'Solo un administrador puede gestionar las prioridades.');

        $priority = $this->authorizedPriority($user, $id);

        $remaining = $this->taskPriorityRepository->listForCompany($user->company_id)->count();
        abort_if($remaining <= 1, 422, 'Debe existir al menos una prioridad.');

        $inUse = Task::query()
            ->where('company_id', $user->company_id)
            ->where('priority', $priority->slug)
            ->exists();
        abort_if($inUse, 422, 'No se puede eliminar una prioridad que está siendo usada por tareas.');

        $this->taskPriorityRepository->delete($id);
    }

    protected function authorizedPriority(User $user, int $id): TaskPriority
    {
        $priority = $this->taskPriorityRepository->getById($id);

        if (!$priority || $priority->company_id !== $user->company_id) {
            throw new NotFoundHttpException('Prioridad no encontrada.');
        }

        return $priority;
    }
}
