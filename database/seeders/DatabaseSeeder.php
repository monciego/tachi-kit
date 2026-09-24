<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database. Roles and permissions are always
     * seeded; demo accounts are skipped in production. Create the first
     * production account with `php artisan tachi:superadmin`.
     */
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        if (app()->isProduction()) {
            return;
        }

        $this->call(DemoUserSeeder::class);
    }
}
