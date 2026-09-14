<?php

use App\Domains\Chatbot\Http\Controllers\ChatbotController;
use Illuminate\Support\Facades\Route;

Route::post('chatbot/ask', [ChatbotController::class, 'ask']);
