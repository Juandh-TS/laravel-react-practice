<?php

namespace App\Domains\Task\Services;

use App\Domains\Task\Models\TaskPriority;
use App\Domains\Task\Models\TaskStatus;

/**
 * Single source of truth for the default statuses/priorities a company
 * starts with. Used both when a company is created and to backfill
 * existing companies in the migration that introduced these tables.
 */
class TaskBoardDefaultsService
{
    public const DEFAULT_STATUSES = [
        ['slug' => 'todo', 'label' => 'Por hacer', 'color' => '#64748b', 'position' => 1, 'is_done' => false],
        ['slug' => 'in_progress', 'label' => 'En progreso', 'color' => '#6366f1', 'position' => 2, 'is_done' => false],
        ['slug' => 'done', 'label' => 'Hecho', 'color' => '#10b981', 'position' => 3, 'is_done' => true],
    ];

    public const DEFAULT_PRIORITIES = [
        ['slug' => 'low', 'label' => 'Baja', 'color' => '#64748b', 'position' => 1],
        ['slug' => 'medium', 'label' => 'Media', 'color' => '#6366f1', 'position' => 2],
        ['slug' => 'high', 'label' => 'Alta', 'color' => '#f59e0b', 'position' => 3],
        ['slug' => 'urgent', 'label' => 'Urgente', 'color' => '#f43f5e', 'position' => 4],
    ];

    public function seedForCompany(?int $companyId): void
    {
        foreach (self::DEFAULT_STATUSES as $status) {
            TaskStatus::firstOrCreate(
                ['company_id' => $companyId, 'slug' => $status['slug']],
                $status,
            );
        }

        foreach (self::DEFAULT_PRIORITIES as $priority) {
            TaskPriority::firstOrCreate(
                ['company_id' => $companyId, 'slug' => $priority['slug']],
                $priority,
            );
        }
    }
}
