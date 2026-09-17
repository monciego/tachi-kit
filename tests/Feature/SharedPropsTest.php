<?php

use App\Enums\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Testing\TestResponse;
use Spatie\Permission\Models\Permission as PermissionModel;

function sharedProps(TestResponse $response): array
{
    return $response->viewData('page')['props'];
}

test('guests receive empty roles and can map', function () {
    $props = sharedProps($this->get(route('login')));

    expect($props['auth']['user'])->toBeNull()
        ->and($props['auth']['roles'])->toBe([])
        ->and($props['auth']['can'])->toBe([]);
});

test('authenticated users receive their role names', function () {
    $role = Role::query()->create(['name' => 'user']);
    $user = User::factory()->create()->assignRole($role);

    $props = sharedProps($this->actingAs($user)->get(route('dashboard')));

    expect($props['auth']['roles'])->toHaveCount(1)
        ->and($props['auth']['roles'][0]['name'])->toBe('user')
        ->and($props['roles'])->toBe($props['auth']['roles']);
});

test('can map reflects the users permissions', function () {
    $role = Role::query()->create(['name' => 'admin']);

    collect([Permission::UsersView->value, Permission::UsersCreate->value])->each(
        fn (string $name) => PermissionModel::findOrCreate($name),
    );

    $role->givePermissionTo([
        Permission::UsersView->value,
        Permission::UsersCreate->value,
    ]);

    $user = User::factory()->create()->assignRole($role);

    $props = sharedProps($this->actingAs($user)->get(route('dashboard')));
    $can = $props['auth']['can'];

    expect($can[Permission::UsersCreate->value])->toBeTrue()
        ->and($can[Permission::UsersEdit->value])->toBeFalse()
        ->and($can)->toHaveCount(count(Permission::cases()));
});

test('can map degrades gracefully when permissions are not seeded', function () {
    Role::query()->create(['name' => 'user']);
    $user = User::factory()->create()->assignRole('user');

    $props = sharedProps($this->actingAs($user)->get(route('dashboard')));

    expect($props['auth']['can'])->toBe([
        Permission::UsersView->value => false,
        Permission::UsersCreate->value => false,
        Permission::UsersEdit->value => false,
        Permission::UsersDelete->value => false,
        Permission::RolesView->value => false,
        Permission::RolesCreate->value => false,
        Permission::RolesEdit->value => false,
        Permission::RolesDelete->value => false,
    ]);
});

test('superadmin can do anything even before permissions are seeded', function () {
    Role::query()->create(['name' => 'superadmin']);
    $user = User::factory()->create()->assignRole('superadmin');

    $props = sharedProps($this->actingAs($user)->get(route('dashboard')));

    foreach (Permission::values() as $permission) {
        expect($props['auth']['can'][$permission])->toBeTrue();
    }
});
