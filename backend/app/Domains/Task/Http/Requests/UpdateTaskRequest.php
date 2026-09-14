<?php

namespace App\Domains\Task\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
        ];
    }
}
