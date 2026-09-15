<?php

namespace App\Domains\Tag\Repositories\Eloquent;

use App\Domains\Tag\Models\Tag;
use App\Domains\Tag\Repositories\Contracts\TagRepositoryInterface;
use App\Domains\User\Models\User;
use Illuminate\Database\Eloquent\Collection;

class TagRepository implements TagRepositoryInterface
{
    public function __construct(protected Tag $tag) {}

    public function getForUser(User $user): Collection
    {
        return $this->tag->query()
            ->where(function ($q) use ($user) {
                $q->whereNull('company_id');
                if ($user->company_id) {
                    $q->orWhere('company_id', $user->company_id);
                }
            })
            ->orderBy('name')
            ->get();
    }

    public function getById(int $id): ?Tag
    {
        return $this->tag->find($id);
    }

    public function firstOrCreate(array $attributes, array $values = []): Tag
    {
        return $this->tag->firstOrCreate($attributes, $values);
    }

    public function delete(int $id): bool
    {
        $tag = $this->getById($id);
        if (!$tag) {
            return false;
        }

        return (bool) $tag->delete();
    }
}
