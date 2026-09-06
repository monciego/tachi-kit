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
            'name' => 'Superadmin',
            'email' => 'superadmin@tachikit.com',
        ]);

        User::factory()->asAdmin()->create([
            'name' => 'Administrator',
            'email' => 'administrator@tachikit.com',
        ]);

        User::factory()->asAdmin()->create([
            'name' => 'Admin Two',
            'email' => 'admin@tachikit.com',
        ]);

        User::factory()->asUser()->count(50)->create();
    }
}
