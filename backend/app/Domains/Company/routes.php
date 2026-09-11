<?php

use App\Domains\Company\Http\Controllers\CompanyController;
use Illuminate\Support\Facades\Route;

Route::apiResource('companies', CompanyController::class);
