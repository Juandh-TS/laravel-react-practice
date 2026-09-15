<?php

namespace App\Domains\Company\Services;

use App\Domains\Company\Models\Company;
use App\Domains\Company\Repositories\Contracts\CompanyRepositoryInterface;
use App\Domains\User\Models\User;
use Illuminate\Database\Eloquent\Collection;

class CompanyService
{

    public function __construct(protected CompanyRepositoryInterface $companyRepository) {}

    public function getAll(User $user): Collection
    {
        if ($user->isAdmin()) {
            return $this->companyRepository->getAll();
        }

        if (! $user->company_id) {
            return new Collection();
        }

        return Company::where('id', $user->company_id)->withCount('users')->get();  
    }

    public function getById(int $id)
    {
        return $this->companyRepository->getById($id);
    }

    public function create(array $data, User $user)
    {   
        if (! $user->isAdmin()) {
            throw new \Exception('Unauthorized');
        }
        return $this->companyRepository->create($data);
    }

    public function update(int $id, array $data, User $user)
    {
        if (! $user->isAdmin()) {
            throw new \Exception('Unauthorized');
        }

        return $this->companyRepository->update($id, $data);
    }

    public function delete(int $id, User $user)
    {
        if (! $user->isAdmin()) {
            throw new \Exception('Unauthorized');
        }
        
        $this->companyRepository->delete($id);
    }
}