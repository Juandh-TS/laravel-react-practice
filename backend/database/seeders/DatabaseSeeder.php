<?php

namespace Database\Seeders;

use App\Domains\Company\Models\Company;
use App\Domains\Task\Models\Task;
use App\Domains\User\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $companies = Company::factory(8)->create();

        User::factory(25)
            ->sequence(fn () => ['company_id' => $companies->random()->id])
            ->create();

        User::factory(10)->create([
            'company_id' => null,
        ]);

        $users = User::all();

        Task::factory(40)->sequence(fn () => [
            'user_id' => ($user = $users->random())->id,
            'company_id' => $user->company_id,
        ])->create();
    }
}
