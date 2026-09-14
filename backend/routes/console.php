<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Revisa cada segundo si hay usuarios inactivos (>15s sin volver a iniciar sesión) y los desactiva.
// Nota: para que corra con esta granularidad hay que mantener el planificador vivo con
// `php artisan schedule:work` en lugar del cron tradicional de 1 minuto.
Schedule::command('users:deactivate-inactive')->everySecond();
