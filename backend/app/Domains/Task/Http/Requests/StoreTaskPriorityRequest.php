<?php

namespace App\Domains\Task\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskPriorityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'max:20', 'regex:/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/'],
        ];
    }
}
