<?php

namespace App\Domains\Task\Services;

use App\Domains\Task\Models\Task;
use App\Domains\Task\Models\TaskStatus;
use App\Domains\Task\Repositories\Contracts\TaskStatusRepositoryInterface;
use App\Domains\User\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TaskStatusService
{
    public function __construct(protected TaskStatusRepositoryInterface $taskStatusRepository) {}

    public function list(User $user): Collection
    {
        return $this->taskStatusRepository->listForCompany($user->company_id);
    }

    public function create(User $user, array $data): TaskStatus
    {
        abort_unless($user->isAdmin(), 403, 'Solo un administrador puede gestionar los estados.');

        $slug = Str::slug($data['label'], '_');
        abort_if(
            $this->taskStatusRepository->slugExists($user->company_id, $slug),
            422,
            'Ya existe un estado con un nombre equivalente.',
        );

        $position = ($this->taskStatusRepository->getMaxPosition($user->company_id) ?? 0) + 1;

        $status = $this->taskStatusRepository->create([
            'company_id' => $user->company_id,
            'slug' => $slug,
            'label' => $data['label'],
            'color' => $data['color'] ?? '#64748b',
            'position' => $position,
            'is_done' => $data['is_done'] ?? false,
        ]);

        if ($status->is_done) {
            $this->taskStatusRepository->clearDoneExcept($user->company_id, $status->id);
        }

        return $status;
    }

    public function update(User $user, int $id, array $data): TaskStatus
    {
        abort_unless($user->isAdmin(), 403, 'Solo un administrador puede gestionar los estados.');

        $status = $this->authorizedStatus($user, $id);

        $status = $this->taskStatusRepository->update($id, array_filter([
            'label' => $data['label'] ?? null,
            'color' => $data['color'] ?? null,
            'position' => $data['position'] ?? null,
            'is_done' => array_key_exists('is_done', $data) ? $data['is_done'] : null,
        ], fn ($value) => $value !== null));

        if (!empty($data['is_done'])) {
            $this->taskStatusRepository->clearDoneExcept($user->company_id, $status->id);
        }

        return $status;
    }

    public function delete(User $user, int $id): void
    {
        abort_unless($user->isAdmin(), 403, 'Solo un administrador puede gestionar los estados.');

        $status = $this->authorizedStatus($user, $id);

        $remaining = $this->taskStatusRepository->listForCompany($user->company_id)->count();
        abort_if($remaining <= 1, 422, 'Debe existir al menos un estado en el tablero.');

        $inUse = Task::query()
            ->where('company_id', $user->company_id)
            ->where('status', $status->slug)
            ->exists();
        abort_if($inUse, 422, 'No se puede eliminar un estado que está siendo usado por tareas.');

        $this->taskStatusRepository->delete($id);
    }

    protected function authorizedStatus(User $user, int $id): TaskStatus
    {
        $status = $this->taskStatusRepository->getById($id);

        if (!$status || $status->company_id !== $user->company_id) {
            throw new NotFoundHttpException('Estado no encontrado.');
        }

        return $status;
    }
}
