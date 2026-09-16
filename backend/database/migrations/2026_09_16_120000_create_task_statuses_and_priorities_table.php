<?php

use App\Domains\Company\Models\Company;
use App\Domains\Task\Services\TaskBoardDefaultsService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_statuses', function (Blueprint $table) {
            $table->id();
            // Nullable: users without a company (seen in the wild in this app,
            // e.g. admin accounts created before company assignment existed)
            // share one global bucket, same fallback pattern as `tags`.
            $table->foreignId('company_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('slug');
            $table->string('label');
            $table->string('color')->default('#64748b');
            $table->integer('position')->default(0);
            $table->boolean('is_done')->default(false);
            $table->timestamps();

            $table->unique(['company_id', 'slug']);
        });

        Schema::create('task_priorities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('slug');
            $table->string('label');
            $table->string('color')->default('#64748b');
            $table->integer('position')->default(0);
            $table->timestamps();

            $table->unique(['company_id', 'slug']);
        });

        $defaults = new TaskBoardDefaultsService();

        // Shared bucket for company-less users.
        $defaults->seedForCompany(null);

        Company::query()->select('id')->chunkById(100, function ($companies) use ($defaults) {
            foreach ($companies as $company) {
                $defaults->seedForCompany($company->id);
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_priorities');
        Schema::dropIfExists('task_statuses');
    }
};
