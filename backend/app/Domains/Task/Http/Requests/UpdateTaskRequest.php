<?php

namespace App\Domains\Task\Http\Requests;

use App\Domains\Task\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        // La autorización por objeto (dueño, asignador, admin o misma compañía)
        // se resuelve en el controller, ya que depende del {id} de la ruta.
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'completed' => ['sometimes', 'boolean'],
            'status' => ['sometimes', Rule::in(Task::STATUSES)],
            'start_date' => ['sometimes', 'nullable', 'date'],
            'end_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:start_date'],
        ];
    }
}
