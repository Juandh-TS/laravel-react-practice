<?php

namespace App\Domains\Comment\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // La autorización de acceso a la tarea (dueño, asignador, admin o
        // misma compañía) se resuelve en el controller/service.
        return true;
    }

    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:2000'],
        ];
    }
}
