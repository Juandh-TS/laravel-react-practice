<?php

use App\Domains\Company\Http\Controllers\CompanyController;
use App\Domains\Task\Http\Controllers\TaskController;
use App\Domains\User\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('tasks', TaskController::class);
Route::apiResource('users', UserController::class);
Route::apiResource('companies', CompanyController::class);
