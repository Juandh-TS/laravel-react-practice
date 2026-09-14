<?php

namespace App\Domains\Auth\Http\Controllers;

use App\Domains\User\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Auth', description: 'Authentication endpoints')]
class AuthController extends Controller
{
    /**
     * Register a new user and issue an API token.
     */
    #[OA\Post(
        path: '/api/register',
        tags: ['Auth'],
        summary: 'Register a new user',
        responses: [
            new OA\Response(response: 201, description: 'User registered'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'company_id' => ['nullable', 'exists:companies,id'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'company_id' => $validated['company_id'] ?? null,
        ]);

        $token = $user->createToken('spa')->plainTextToken;

        return response()->json([
            'user' => $user->load('company'),
            'token' => $token,
        ], 201);
    }

    /**
     * Authenticate a user and issue an API token.
     */
    #[OA\Post(
        path: '/api/login',
        tags: ['Auth'],
        summary: 'Authenticate a user',
        responses: [
            new OA\Response(response: 200, description: 'Successful login'),
            new OA\Response(response: 422, description: 'Invalid credentials'),
        ]
    )]
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Esta cuenta está inactiva. Contacta a un administrador.'],
            ]);
        }

        $user->forceFill(['last_login_at' => now()])->save();

        $token = $user->createToken('spa')->plainTextToken;

        return response()->json([
            'user' => $user->load('company'),
            'token' => $token,
        ]);
    }

    /**
     * Revoke the token used for the current request.
     */
    #[OA\Post(
        path: '/api/logout',
        tags: ['Auth'],
        summary: 'Revoke the current access token',
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 204, description: 'Successfully logged out'),
        ]
    )]
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }

    /**
     * Return the authenticated user.
     */
    #[OA\Get(
        path: '/api/me',
        tags: ['Auth'],
        summary: 'Get the authenticated user',
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation'),
        ]
    )]
    public function me(Request $request)
    {
        return $request->user()->load('company');
    }
}
