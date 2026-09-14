<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('assigned_by_user_id')
            ->nullable()
            ->after('user_id')
            ->constrained('users')
            ->nullOnDelete();

            //Gurdar la fechora y hora de la asignación de la tarea
            $table->timestamp('assigned_at')->nullable()->after('assigned_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropConstrainedForeignId('assigned_by_user_id');
            $table->dropColumn('assigned_at');
        });
    }
};
