<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Company::withCount('users')->latest()->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:companies,name'],
        ]);

        $company = Company::create($validated);

        return response()->json($company, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Company $company)
    {
        return $company->loadCount('users')->load('users');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('companies', 'name')->ignore($company->id)],
        ]);

        $company->update($validated);

        return $company->loadCount('users');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Company $company)
    {
        $company->delete();

        return response()->noContent();
    }
}
