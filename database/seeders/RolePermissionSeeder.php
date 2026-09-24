<?php

namespace Database\Seeders;

use App\Enums\Permission as PermissionEnum;
use App\Enums\RoleName;
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

        $superadmin = Role::query()->firstOrCreate(['name' => RoleName::Superadmin->value]);
        $superadmin->givePermissionTo(PermissionEnum::values());

        $admin = Role::query()->firstOrCreate(['name' => RoleName::Admin->value]);
        $admin->givePermissionTo([
            PermissionEnum::UsersView->value,
            PermissionEnum::UsersCreate->value,
            PermissionEnum::UsersEdit->value,
            PermissionEnum::UsersDelete->value,
            PermissionEnum::UsersStatus->value,
        ]);

        Role::query()->firstOrCreate(['name' => RoleName::User->value]);
    }
}
