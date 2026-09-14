<?php

namespace App\Domains\Task\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Cualquier usuario autenticado puede crear tareas; la autorización
        // por objeto (quién puede ver/editar una tarea puntual) vive en el controller.
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'user_id' => ['nullable', 'exists:users,id'],
        ];
    }
}
