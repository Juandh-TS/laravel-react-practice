<?php

namespace App\Console\Commands;

use App\Domains\User\Models\User;
use Illuminate\Console\Command;

class DeactivateInactiveUsers extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'users:deactivate-inactive';

    /**
     * The console command description.
     */
    protected $description = 'Desactiva usuarios que llevan más de 15 segundos sin volver a iniciar sesión desde su último login';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $count = User::query()
            ->where('is_active', true)
            ->whereNotNull('last_login_at')
            ->where('last_login_at', '<=', now()->subSeconds(15))
            ->update(['is_active' => false]);

        if ($count > 0) {
            $this->info("Se desactivaron {$count} usuario(s) por inactividad.");
        }

        return self::SUCCESS;
    }
}
