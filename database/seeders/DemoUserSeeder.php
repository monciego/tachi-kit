<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Demo accounts for local development. All of them use the password "password",
 * so this seeder must never run in production (see DatabaseSeeder).
 */
class DemoUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (User::query()->exists()) {
            return;
        }

        User::factory()->asSuperadmin()->create([
            'user_code' => User::generateUserCode(),
            'name' => 'Superadmin',
            'email' => 'superadmin@tachikit.com',
        ]);

        User::factory()->asSuperadmin()->create([
            'user_code' => User::generateUserCode(),
            'name' => 'Superadmin II',
            'email' => 'superadmin2@tachikit.com',
        ]);

        User::factory()->asAdmin()->create([
            'user_code' => User::generateUserCode(),
            'name' => 'Administrator',
            'email' => 'administrator@tachikit.com',
        ]);

        User::factory()->asAdmin()->create([
            'user_code' => User::generateUserCode(),
            'name' => 'Admin Two',
            'email' => 'admin@tachikit.com',
        ]);

        // Spread demo members over the past year (with a few inactive
        // accounts) so the dashboard stats and sign-ups chart have data.
        for ($i = 0; $i < 50; $i++) {
            User::factory()->asUser()->create([
                'user_code' => User::generateUserCode(),
                'is_active' => fake()->boolean(90),
                'created_at' => fake()->dateTimeBetween(now()->subMonths(11)->startOfMonth(), now()),
            ]);
        }
    }
}
