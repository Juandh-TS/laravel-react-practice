<?php

namespace App\Domains\Company\Http\Controllers;

use App\Domains\Company\Http\Requests\StoreCompanyRequest;
use App\Domains\Company\Http\Requests\UpdateCompanyRequest;
use App\Domains\Company\Http\Resources\CompanyResource;
use App\Domains\Company\Repositories\Contracts\CompanyRepositoryInterface;
use App\Http\Controllers\Controller;

class CompanyController extends Controller
{
    protected $companyRepository;

    public function __construct(CompanyRepositoryInterface $companyRepository)
    {
        $this->companyRepository = $companyRepository;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return CompanyResource::collection($this->companyRepository->getAll());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCompanyRequest $request)
    {
        $company = $this->companyRepository->create($request->validated());

        return (new CompanyResource($company))->response()->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        return new CompanyResource($this->companyRepository->getById($id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCompanyRequest $request, int $id)
    {
        return new CompanyResource($this->companyRepository->update($id, $request->validated()));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id)
    {
        $this->companyRepository->delete($id);

        return response()->noContent();
    }
}
