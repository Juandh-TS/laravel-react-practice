<?php

namespace App\Domains\Task\Http\Requests;

use App\Domains\Task\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'status' => ['sometimes', Rule::in(Task::STATUSES)],
            'start_date' => ['sometimes', 'nullable', 'date'],
            'end_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:start_date'],
        ];
    }
}
