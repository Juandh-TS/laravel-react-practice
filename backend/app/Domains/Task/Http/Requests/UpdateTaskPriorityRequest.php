<?php

namespace App\Domains\Task\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskPriorityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label' => ['sometimes', 'string', 'max:50'],
            'color' => ['sometimes', 'string', 'max:20', 'regex:/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/'],
            'position' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
