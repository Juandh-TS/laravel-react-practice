<?php

namespace App\Providers;

use App\Domains\Company\Repositories\Contracts\CompanyRepositoryInterface;
use App\Domains\Company\Repositories\Eloquent\CompanyRepository;
use App\Domains\Task\Repositories\Contracts\TaskRepositoryInterface;
use App\Domains\Task\Repositories\Eloquent\TaskRepository;
use App\Domains\User\Repositories\Contracts\UserRepositoryInterface;
use App\Domains\User\Repositories\Eloquent\UserRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(TaskRepositoryInterface::class, TaskRepository::class);
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(CompanyRepositoryInterface::class, CompanyRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
