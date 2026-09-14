<?php

use App\Domains\User\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::patch('users/{id}/toggle-active', [UserController::class, 'toggleActive']);
Route::apiResource('users', UserController::class);
