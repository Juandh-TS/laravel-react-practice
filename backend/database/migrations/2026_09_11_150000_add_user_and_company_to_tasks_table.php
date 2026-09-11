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
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
        });

        $fallbackUserId = DB::table('users')->orderBy('id')->value('id');

        if ($fallbackUserId) {
            DB::table('tasks')->whereNull('user_id')->update(['user_id' => $fallbackUserId]);
        }

        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropConstrainedForeignId('company_id');
        });
    }
};
