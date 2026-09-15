<?php

namespace App\Domains\Tag\Services;

use App\Domains\Tag\Models\Tag;
use App\Domains\Tag\Repositories\Contracts\TagRepositoryInterface;
use App\Domains\User\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TagService
{
    public function __construct(protected TagRepositoryInterface $tagRepository) {}

    public function listTags(User $user): Collection
    {
        return $this->tagRepository->getForUser($user);
    }

    public function createTag(User $user, array $data): Tag
    {
        return $this->tagRepository->firstOrCreate([
            'name' => trim($data['name']),
            'company_id' => $user->company_id,
        ], [
            'color' => $data['color'] ?? '#6366f1',
        ]);
    }

    public function deleteTag(User $user, int $id): void
    {
        $tag = $this->tagRepository->getById($id);

        if (!$tag) {
            throw new NotFoundHttpException('Tag no encontrado');
        }

        if ($tag->company_id && $tag->company_id !== $user->company_id && !$user->isAdmin()) {
            abort(403, 'No autorizado para eliminar este tag');
        }

        $this->tagRepository->delete($id);
    }
}
