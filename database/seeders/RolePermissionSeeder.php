<?php

namespace Database\Seeders;

use App\Enums\Permission as PermissionEnum;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $registrar = app(PermissionRegistrar::class);
        $registrar->forgetCachedPermissions();

        foreach (PermissionEnum::cases() as $permission) {
            Permission::query()->firstOrCreate(['name' => $permission->value]);
        }

        $registrar->forgetCachedPermissions();

        $superadmin = Role::query()->firstOrCreate(['name' => 'superadmin']);
        $superadmin->givePermissionTo(PermissionEnum::values());

        $admin = Role::query()->firstOrCreate(['name' => 'admin']);
        $admin->givePermissionTo([
            PermissionEnum::UsersView->value,
            PermissionEnum::UsersCreate->value,
            PermissionEnum::UsersEdit->value,
            PermissionEnum::UsersDelete->value,
        ]);

        Role::query()->firstOrCreate(['name' => 'user']);
    }
}
