<?php

namespace Database\Seeders;

use App\Models\User;
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
        $this->call([
            RolePermissionSeeder::class,
        ]);

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

        for ($i = 0; $i < 50; $i++) {
            User::factory()->asUser()->create([
                'user_code' => User::generateUserCode(),
            ]);
        }
    }
}
