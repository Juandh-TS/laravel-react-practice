<?php

use Illuminate\Support\Facades\Route;

require app_path('Domains/Auth/routes.php');

Route::middleware('auth:sanctum')->group(function () {
    require app_path('Domains/Company/routes.php');
    require app_path('Domains/Task/routes.php');
    require app_path('Domains/Comment/routes.php');
    require app_path('Domains/User/routes.php');
    require app_path('Domains/Chatbot/routes.php');
});
