<?php

namespace App\Domains\Company\Http\Controllers;

use App\Domains\Company\Repositories\Contracts\CompanyRepositoryInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

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
        return $this->companyRepository->getAll();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:companies,name'],
        ]);

        $company = $this->companyRepository->create($validated);

        return response()->json($company, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        return $this->companyRepository->getById($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('companies', 'name')->ignore($id)],
        ]);

        return $this->companyRepository->update($id, $validated);
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
