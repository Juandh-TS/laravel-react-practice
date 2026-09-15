<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->double('position')->nullable()->after('priority');
        });

        DB::table('tasks')
            ->orderBy('created_at')
            ->get(['id', 'status'])
            ->groupBy('status')
            ->each(function ($tasks) {
                foreach ($tasks->values() as $index => $task) {
                    DB::table('tasks')
                        ->where('id', $task->id)
                        ->update(['position' => ($index + 1) * 1000]);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn('position');
        });
    }
};
