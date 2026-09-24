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

test('lists system roles before custom roles', function () {
    Role::query()->create(['name' => 'Auditor']);

    $user = User::factory()->asSuperadmin()->create();

    $this->actingAs($user)
        ->get(route('roles.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('roles/index')
            ->where('roles.data.0.name', 'superadmin')
            ->where('roles.data.1.name', 'admin')
            ->where('roles.data.2.name', 'user')
            ->where('roles.data.3.name', 'Auditor')
        );
});

test('creates a role and flashes a toast', function () {
    $user = User::factory()->asSuperadmin()->create();

    $this->actingAs($user)
        ->post(route('roles.store'), [
            'name' => 'Auditor',
            'permissions' => [Permission::UsersView->value],
        ])
        ->assertRedirect(route('roles.index'))
        ->assertInertiaFlash('toast', ['type' => 'success', 'message' => 'Role Auditor created.']);

    expect(Role::findByName('Auditor')->hasPermissionTo(Permission::UsersView->value))->toBeTrue();
});

test('updates a role and flashes a toast', function () {
    $role = Role::query()->create(['name' => 'Auditor']);
    $user = User::factory()->asSuperadmin()->create();

    $this->actingAs($user)
        ->put(route('roles.update', $role), [
            'name' => 'Reviewer',
            'permissions' => [Permission::RolesView->value],
        ])
        ->assertRedirect(route('roles.index'))
        ->assertInertiaFlash('toast', ['type' => 'success', 'message' => 'Role Reviewer updated.']);

    expect($role->fresh()->name)->toBe('Reviewer');
});

test('deletes a role and flashes a toast', function () {
    $role = Role::query()->create(['name' => 'Auditor']);
    $user = User::factory()->asSuperadmin()->create();

    $this->actingAs($user)
        ->delete(route('roles.destroy', $role))
        ->assertRedirect(route('roles.index'))
        ->assertInertiaFlash('toast', ['type' => 'success', 'message' => 'Role deleted.']);

    $this->assertModelMissing($role);
});

/**
 * Create a user whose only role grants the given role permissions.
 *
 * @param  list<Permission>  $permissions
 */
function roleManager(array $permissions): User
{
    $role = Role::query()->create(['name' => 'Role Manager']);
    $role->givePermissionTo(array_map(fn (Permission $permission) => $permission->value, $permissions));

    return User::factory()->create()->assignRole($role);
}

test('lists roles for users with the roles.view permission', function () {
    $this->actingAs(roleManager([Permission::RolesView]))
        ->get(route('roles.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('roles/index')
            ->has('roles.data', 4)
            ->where('roles.data.0.users_count', 0)
        );
});

test('forbids listing roles without the roles.view permission', function () {
    $this->actingAs(User::factory()->asAdmin()->create())
        ->get(route('roles.index'))
        ->assertForbidden();
});

test('searches roles by name', function () {
    Role::query()->create(['name' => 'Auditor']);

    $this->actingAs(User::factory()->asSuperadmin()->create())
        ->get(route('roles.index', ['search' => 'audit']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('roles.data', 1)
            ->where('roles.data.0.name', 'Auditor')
        );
});

test('redirects to the last valid listing when the page is out of range', function () {
    $this->actingAs(User::factory()->asSuperadmin()->create())
        ->get(route('roles.index', ['page' => 5, 'search' => 'admin']))
        ->assertRedirect(route('roles.index', ['search' => 'admin']));
});

test('renders the create role page with every permission', function () {
    $this->actingAs(roleManager([Permission::RolesCreate]))
        ->get(route('roles.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('roles/create')
            ->where('permissions', Permission::values())
        );
});

test('forbids creating roles without the roles.create permission', function () {
    $user = User::factory()->asAdmin()->create();

    $this->actingAs($user)->get(route('roles.create'))->assertForbidden();

    $this->actingAs($user)
        ->post(route('roles.store'), ['name' => 'Auditor', 'permissions' => [Permission::UsersView->value]])
        ->assertForbidden();

    expect(Role::query()->where('name', 'Auditor')->exists())->toBeFalse();
});

test('validates the role name and permissions', function (array $payload, string $field) {
    Role::query()->create(['name' => 'Auditor']);

    $this->actingAs(User::factory()->asSuperadmin()->create())
        ->post(route('roles.store'), $payload)
        ->assertSessionHasErrors($field);
})->with([
    'missing name' => [['permissions' => ['users.view']], 'name'],
    'duplicate name' => [['name' => 'Auditor', 'permissions' => ['users.view']], 'name'],
    'no permissions' => [['name' => 'Reviewer', 'permissions' => []], 'permissions'],
    'unknown permission' => [['name' => 'Reviewer', 'permissions' => ['posts.publish']], 'permissions.0'],
]);

test('forbids updating system roles', function () {
    $admin = Role::query()->where('name', 'admin')->sole();

    $this->actingAs(roleManager([Permission::RolesEdit]))
        ->put(route('roles.update', $admin), ['name' => 'boss', 'permissions' => [Permission::UsersView->value]])
        ->assertForbidden();

    expect($admin->fresh()->name)->toBe('admin');
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

test('forbids deleting roles without the roles.delete permission', function () {
    $role = Role::query()->create(['name' => 'Auditor']);

    $this->actingAs(roleManager([Permission::RolesView]))
        ->delete(route('roles.destroy', $role))
        ->assertForbidden();

    $this->assertModelExists($role);
});
