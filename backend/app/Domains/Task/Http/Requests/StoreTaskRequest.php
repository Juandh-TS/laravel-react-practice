<?php

namespace App\Domains\Task\Http\Requests;

use App\Domains\Task\Models\TaskPriority;
use App\Domains\Task\Models\TaskStatus;
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
            'status' => ['sometimes', Rule::in($this->availableStatusSlugs())],
            'priority' => ['sometimes', Rule::in($this->availablePrioritySlugs())],
            'start_date' => ['sometimes', 'nullable', 'date'],
            'end_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:start_date'],
            'tag_ids' => ['sometimes', 'array'],
            'tag_ids.*' => ['integer', 'exists:tags,id'],
        ];
    }

    private function availableStatusSlugs(): array
    {
        return TaskStatus::query()->where('company_id', $this->user()?->company_id)->pluck('slug')->all();
    }

    private function availablePrioritySlugs(): array
    {
        return TaskPriority::query()->where('company_id', $this->user()?->company_id)->pluck('slug')->all();
    }
}
