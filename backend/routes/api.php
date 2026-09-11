<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

require app_path('Domains/Company/routes.php');
require app_path('Domains/Task/routes.php');
require app_path('Domains/User/routes.php');
