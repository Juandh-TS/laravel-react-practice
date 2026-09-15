<?php

namespace App\Domains\Company\Http\Controllers;

use App\Domains\Company\Http\Requests\StoreCompanyRequest;
use App\Domains\Company\Http\Requests\UpdateCompanyRequest;
use App\Domains\Company\Http\Resources\CompanyResource;
use App\Domains\Company\Repositories\Contracts\CompanyRepositoryInterface;
use App\Domains\Company\Services\CompanyService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Companies', description: 'Company management endpoints')]
class CompanyController extends Controller
{
    public function __construct(protected CompanyService $companyService){}
    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: '/api/companies',
        tags: ['Companies'],
        summary: 'List all companies',
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation'),
        ]
    )]
    public function index(Request $request)
    {
       $companies = $this->companyService->getAll($request->user());

       return CompanyResource::collection($companies);
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: '/api/companies',
        tags: ['Companies'],
        summary: 'Create a new company',
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 201, description: 'Company created'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreCompanyRequest $request)
    {
        $company = $this->companyService->create($request->validated(), $request->user());

        return (new CompanyResource($company))->response()->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: '/api/companies/{id}',
        tags: ['Companies'],
        summary: 'Get a single company',
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation'),
            new OA\Response(response: 404, description: 'Company not found'),
        ]
    )]
    public function show(int $id)
    {
        return new CompanyResource($this->companyService->getById($id));
    }

    /**
     * Update the specified resource in storage.
     */
    #[OA\Put(
        path: '/api/companies/{id}',
        tags: ['Companies'],
        summary: 'Update a company',
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Company updated'),
            new OA\Response(response: 404, description: 'Company not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateCompanyRequest $request, int $id)
    {
        return new CompanyResource($this->companyService->update($id, $request->validated(), $request->user()));
    }

    /**
     * Remove the specified resource from storage.
     */
    #[OA\Delete(
        path: '/api/companies/{id}',
        tags: ['Companies'],
        summary: 'Delete a company',
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Company deleted'),
            new OA\Response(response: 404, description: 'Company not found'),
        ]
    )]
    public function destroy(int $id, Request $request)
    {
        $this->companyService->delete($id, $request->user());

        return response()->noContent();
    }
}
