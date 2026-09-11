<?php

namespace App\Repositories\Eloquent;

use App\Models\Company;
use App\Repositories\Contracts\CompanyRepositoryInterface;

class CompanyRepository implements CompanyRepositoryInterface
{
    protected $company;

    public function __construct(Company $company)
    {
        $this->company = $company;
    }

    public function getAll()
    {
        return $this->company->latest()->get();
    }

    public function getById(int $id)
    {
        return $this->company->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->company->create($data);
    }

    public function update(int $id, array $data)
    {
        $company = $this->getById($id);
        $company->update($data);
        return $company;
    }

    public function delete(int $id)
    {
        $company = $this->getById($id);
        $company->delete();
        return $company;
    }
}