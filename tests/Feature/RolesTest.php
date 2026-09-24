<?php

use App\Enums\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Auth;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

describe('guest access', function () {
    beforeEach(fn () => Auth::logout());

    test('guests are redirected to the login page', function () {
        $this->get(route('roles.index'))->assertRedirect(route('login'));
    });
});

test('renders the edit role page with a flat role payload', function () {
    $role = Role::query()->create(['name' => 'Editor']);
    $role->givePermissionTo([
        Permission::UsersView->value,
        Permission::RolesView->value,
    ]);

    $manager = Role::query()->create(['name' => 'Role Manager']);
    $manager->givePermissionTo(Permission::RolesEdit->value);

    $user = User::factory()->create()->assignRole($manager);

    $this->actingAs($user)
        ->get(route('roles.edit', $role))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('roles/edit')
            ->where('role.id', $role->id)
            ->where('role.name', 'Editor')
            ->where('role.is_system_role', false)
            ->where('role.permissions', fn ($permissions) => collect($permissions)->sort()->values()->all() === [
                Permission::RolesView->value,
                Permission::UsersView->value,
            ])
            ->has('permissions', count(Permission::cases()))
        );
});

test('forbids non-superadmins from editing a system role', function () {
    $admin = Role::query()->where('name', 'admin')->sole();

    $manager = Role::query()->create(['name' => 'Role Manager']);
    $manager->givePermissionTo(Permission::RolesEdit->value);

    $user = User::factory()->create()->assignRole($manager);

    $this->actingAs($user)
        ->get(route('roles.edit', $admin))
        ->assertForbidden();
});

test('forbids users without the roles.edit permission', function () {
    $role = Role::query()->create(['name' => 'Editor']);

    $user = User::factory()->asUser()->create();

    $this->actingAs($user)
        ->get(route('roles.edit', $role))
        ->assertForbidden();
});

test('forbids deleting system roles, even for superadmins', function () {
    $user = Role::query()->where('name', 'user')->sole();

    $this->actingAs(User::factory()->asSuperadmin()->create())
        ->delete(route('roles.destroy', $user))
        ->assertForbidden();

    $this->assertModelExists($user);
});

test('forbids deleting roles that still have users', function () {
    $role = Role::query()->create(['name' => 'Auditor']);
    User::factory()->create()->assignRole($role);

    $this->actingAs(User::factory()->asSuperadmin()->create())
        ->delete(route('roles.destroy', $role))
        ->assertForbidden();

    $this->assertModelExists($role);
});
