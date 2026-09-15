<?php

use App\Domains\Comment\Http\Controllers\CommentController;
use Illuminate\Support\Facades\Route;

Route::apiResource('tasks.comments', CommentController::class)->only(['index', 'store', 'destroy']);
