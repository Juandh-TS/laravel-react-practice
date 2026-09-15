<?php

use App\Domains\Tag\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;

Route::apiResource('tags', TagController::class)->only(['index', 'store', 'destroy']);
