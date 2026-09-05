<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Role::query()->firstOrCreate(['name' => 'superadmin']);
        Role::query()->firstOrCreate(['name' => 'admin']);
        Role::query()->firstOrCreate(['name' => 'user']);
    }
}
