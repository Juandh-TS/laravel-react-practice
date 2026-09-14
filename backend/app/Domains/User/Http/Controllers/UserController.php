<?php

namespace App\Domains\User\Http\Controllers;

use App\Domains\User\Repositories\Contracts\UserRepositoryInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    protected $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return $this->userRepository->getAll();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'company_id' => ['nullable', 'exists:companies,id'],
        ]);

        $user = $this->userRepository->create($validated);

        return response()->json($user->load('company'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        return $this->userRepository->getById($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($id)],
            'password' => ['sometimes', 'string', 'min:8'],
            'company_id' => ['nullable', 'exists:companies,id'],
        ]);

        return $this->userRepository->update($id, $validated);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id)
    {
        $this->userRepository->delete($id);

        return response()->noContent();
    }

    /**
     * Toggle the active status of the specified resource.
     */
    public function toggleActive(int $id)
    {
        return $this->userRepository->toggleActive($id);
    }
}
