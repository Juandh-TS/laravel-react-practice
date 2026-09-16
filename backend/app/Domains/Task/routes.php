<?php

use App\Domains\Task\Http\Controllers\TaskController;
use App\Domains\Task\Http\Controllers\TaskPriorityController;
use App\Domains\Task\Http\Controllers\TaskStatusController;
use Illuminate\Support\Facades\Route;

Route::apiResource('tasks', TaskController::class);
Route::apiResource('task-statuses', TaskStatusController::class)->only(['index', 'store', 'update', 'destroy']);
Route::apiResource('task-priorities', TaskPriorityController::class)->only(['index', 'store', 'update', 'destroy']);
