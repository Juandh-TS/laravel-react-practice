<?php

namespace App\Providers;

use App\Domains\Comment\Repositories\Contracts\CommentRepositoryInterface;
use App\Domains\Comment\Repositories\Eloquent\CommentRepository;
use App\Domains\Company\Repositories\Contracts\CompanyRepositoryInterface;
use App\Domains\Company\Repositories\Eloquent\CompanyRepository;
use App\Domains\Tag\Repositories\Contracts\TagRepositoryInterface;
use App\Domains\Tag\Repositories\Eloquent\TagRepository;
use App\Domains\Task\Repositories\Contracts\TaskRepositoryInterface;
use App\Domains\Task\Repositories\Eloquent\TaskRepository;
use App\Domains\User\Repositories\Contracts\UserRepositoryInterface;
use App\Domains\User\Repositories\Eloquent\UserRepository;
use Illuminate\Http\Resources\Json\JsonResource;
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
        $this->app->bind(CommentRepositoryInterface::class, CommentRepository::class);
        $this->app->bind(TagRepositoryInterface::class, TagRepository::class);
    }


    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // El frontend consume JSON plano (sin envoltorio "data"); esto es lo
        // único que realmente controla el wrapping en Resource::collection(),
        // ya que la propiedad estática $wrap por clase no lo hace.
        JsonResource::withoutWrapping();
    }
}
