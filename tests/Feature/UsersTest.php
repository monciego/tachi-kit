<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->asAdmin()->create(['name' => 'Admin User']);
    $this->actingAs($this->admin);
});

describe('guest access', function () {
    beforeEach(fn () => Auth::logout());

    test('guests are redirected to the login page', function () {
        $this->get(route('users.index'))->assertRedirect(route('login'));
    });
});

test('lists users with server-side pagination and roles', function () {
    User::factory()->asUser()
        ->count(12)
        ->sequence(fn ($sequence) => ['created_at' => now()->addMinutes($sequence->index + 1)])
        ->create();

    $this->get(route('users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('users/index')
            ->has('users.data', 10)
            ->where('users.total', 13)
            ->where('users.per_page', 10)
            ->where('users.current_page', 1)
            ->where('users.data.0.id', $this->admin->id)
            ->where('users.data.0.roles', ['admin'])
            ->where('users.data.1.roles', ['user'])
            ->has('roleOptions', 2)
        );
});

test('searches users by name', function () {
    User::factory()->asUser()->create(['name' => 'Zephyr Anantium']);
    User::factory()->asUser()->create(['name' => 'Bobby Tables']);

    $this->get('/users?search=Zephyr')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('users.total', 1)
            ->where('users.data.0.name', 'Zephyr Anantium')
        );
});

test('searches users by email', function () {
    User::factory()->asUser()->create(['email' => 'searchme@example.com']);

    $this->get('/users?search=searchme')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('users.total', 1)
            ->where('users.data.0.email', 'searchme@example.com')
        );
});

test('filters users by role', function () {
    User::factory()->asUser()->count(3)->create();
    User::factory()->asAdmin()->create(['email' => 'second-admin@example.com']);

    $this->get('/users?role=user')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('users.total', 3)
            ->where('users.data.0.roles', ['user'])
        );
});

test('filters users by multiple roles', function () {
    User::factory()->asUser()->count(3)->create();
    User::factory()->asAdmin()->create(['email' => 'second-admin@example.com']);

    $this->get('/users?role=user,admin')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('users.total', 5)
        );
});

test('sorts users by name in both directions', function () {
    User::factory()->asUser()->create(['name' => 'Adam Appleton']);
    User::factory()->asUser()->create(['name' => 'Zoe Zebra']);

    $this->get('/users?sort=name&direction=asc')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('users.data.0.id', $this->admin->id)
            ->where('users.data.1.name', 'Adam Appleton')
        );

    $this->get('/users?sort=name&direction=desc')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('users.data.0.id', $this->admin->id)
            ->where('users.data.1.name', 'Zoe Zebra')
        );
});

test('sorts by created_at by default', function () {
    $newest = User::factory()->asUser()->create(['created_at' => now()->addMinute()]);

    $this->get(route('users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('users.data.0.id', $this->admin->id)
            ->where('users.data.1.id', $newest->id)
        );
});

test('respects the per_page parameter', function () {
    User::factory()->asUser()->count(25)->create();

    $this->get('/users?per_page=50')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('users.per_page', 50)
            ->has('users.data', 26)
        );
});

test('falls back to the default per_page for invalid values', function () {
    User::factory()->asUser()->count(25)->create();

    $this->get('/users?per_page=7')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('users.per_page', 10)
            ->has('users.data', 10)
        );
});

test('deletes a user', function () {
    $target = User::factory()->asUser()->create(['email' => 'target@example.com']);

    $this->from(route('users.index'))
        ->delete(route('users.destroy', $target))
        ->assertRedirect(route('users.index'));

    $this->assertDatabaseMissing('users', ['id' => $target->id]);
});

test('forbids deleting your own account', function () {
    $this->from(route('users.index'))
        ->delete(route('users.destroy', $this->admin))
        ->assertForbidden();

    $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
});

test('hides superadmins from other users', function () {
    User::factory()->asSuperadmin()->create([
        'email' => 'boss@example.com',
        'created_at' => now()->addMinutes(4),
    ]);

    $regular = User::factory()->asUser()->create([
        'email' => 'regular@example.com',
        'created_at' => now()->addMinutes(3),
    ]);

    $this->get(route('users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('users.total', 2)
            ->where('users.data.0.id', $this->admin->id)
            ->where('users.data.1.id', $regular->id)
            ->where('users.data.1.deletable', true)
        );
});

test('hides the superadmin role from the role filter for other users', function () {
    User::factory()->asUser()->create();

    $this->get(route('users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('roleOptions', ['admin', 'user'])
        );
});

test('shows every role in the filter for superadmins', function () {
    $actor = User::factory()->asSuperadmin()->create(['email' => 'actor@example.com']);
    User::factory()->asUser()->create();

    $this->actingAs($actor)
        ->get(route('users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('roleOptions', ['superadmin', 'admin', 'user'])
        );
});

test('marks superadmins as not deletable for superadmins', function () {
    $actor = User::factory()->asSuperadmin()->create([
        'email' => 'actor@example.com',
        'created_at' => now()->addMinutes(2),
    ]);

    $boss = User::factory()->asSuperadmin()->create([
        'email' => 'boss@example.com',
        'created_at' => now()->addMinutes(4),
    ]);

    $regular = User::factory()->asUser()->create([
        'email' => 'regular@example.com',
        'created_at' => now()->addMinutes(3),
    ]);

    $this->actingAs($actor)
        ->get(route('users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('users.total', 4)
            ->where('users.data.0.id', $actor->id)
            ->where('users.data.0.deletable', false)
            ->where('users.data.1.id', $boss->id)
            ->where('users.data.1.deletable', false)
            ->where('users.data.2.id', $regular->id)
            ->where('users.data.2.deletable', true)
        );
});

test('forbids deleting a superadmin', function () {
    $superAdmin = User::factory()->asSuperadmin()->create();

    $this->from(route('users.index'))
        ->delete(route('users.destroy', $superAdmin))
        ->assertForbidden();

    $this->assertDatabaseHas('users', ['id' => $superAdmin->id]);
});

test('bulk delete skips superadmins', function () {
    $superAdmin = User::factory()->asSuperadmin()->create([
        'email' => 'boss@example.com',
    ]);

    $regular = User::factory()->asUser()->create();

    $this->from(route('users.index'))
        ->post(route('users.bulk-delete'), [
            'ids' => [$superAdmin->id, $regular->id, $this->admin->id],
        ])
        ->assertRedirect(route('users.index'));

    $this->assertDatabaseHas('users', ['id' => $superAdmin->id]);
    $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
    $this->assertDatabaseMissing('users', ['id' => $regular->id]);
});

test('bulk deletes the selected users', function () {
    $targets = User::factory()->asUser()->count(3)->create();

    $this->from(route('users.index'))
        ->post(route('users.bulk-delete'), ['ids' => [$targets[0]->id, $targets[1]->id]])
        ->assertRedirect(route('users.index'));

    $this->assertDatabaseMissing('users', ['id' => $targets[0]->id]);
    $this->assertDatabaseMissing('users', ['id' => $targets[1]->id]);
    $this->assertDatabaseHas('users', ['id' => $targets[2]->id]);
});

test('bulk delete never deletes your own account', function () {
    $target = User::factory()->asUser()->create();

    $this->from(route('users.index'))
        ->post(route('users.bulk-delete'), ['ids' => [$this->admin->id, $target->id]])
        ->assertRedirect(route('users.index'));

    $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
    $this->assertDatabaseMissing('users', ['id' => $target->id]);
});

test('bulk delete requires an array of ids', function () {
    $this->from(route('users.index'))
        ->post(route('users.bulk-delete'), ['ids' => 'not-an-array'])
        ->assertSessionHasErrors('ids');
});

test('bulk delete rejects ids that do not exist', function () {
    $this->from(route('users.index'))
        ->post(route('users.bulk-delete'), ['ids' => [99999]])
        ->assertSessionHasErrors('ids.0');
});

test('includes the active status in the users listing', function () {
    $inactive = User::factory()->asUser()->inactive()->create(['email' => 'inactive@example.com']);

    $this->get(route('users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('users.data.0.id', $this->admin->id)
            ->where('users.data.0.is_active', true)
            ->where('users.total', 2)
            ->where('users.data.1.email', $inactive->email)
            ->where('users.data.1.is_active', false)
        );
});

test('filters users by status', function () {
    User::factory()->asUser()->count(3)->create();
    User::factory()->asUser()->inactive()->create(['email' => 'inactive@example.com']);

    $this->get('/users?status=inactive')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('users.total', 1)
            ->where('users.data.0.email', 'inactive@example.com')
            ->where('users.data.0.is_active', false)
        );
});

test('deactivates a user', function () {
    $target = User::factory()->asUser()->create(['email' => 'target@example.com']);

    $this->from(route('users.index'))
        ->patch(route('users.update-status', $target), ['is_active' => false])
        ->assertRedirect(route('users.index'));

    $this->assertDatabaseHas('users', ['id' => $target->id, 'is_active' => false]);
});

test('activates a user', function () {
    $target = User::factory()->asUser()->inactive()->create(['email' => 'target@example.com']);

    $this->from(route('users.index'))
        ->patch(route('users.update-status', $target), ['is_active' => true])
        ->assertRedirect(route('users.index'));

    $this->assertDatabaseHas('users', ['id' => $target->id, 'is_active' => true]);
});

test('forbids changing your own account status', function () {
    $this->from(route('users.index'))
        ->patch(route('users.update-status', $this->admin), ['is_active' => false])
        ->assertForbidden();

    $this->assertDatabaseHas('users', ['id' => $this->admin->id, 'is_active' => true]);
});

test('forbids deactivating a superadmin', function () {
    $superAdmin = User::factory()->asSuperadmin()->create();

    $this->from(route('users.index'))
        ->patch(route('users.update-status', $superAdmin), ['is_active' => false])
        ->assertForbidden();

    $this->assertDatabaseHas('users', ['id' => $superAdmin->id, 'is_active' => true]);
});

test('status update requires a boolean value', function () {
    $target = User::factory()->asUser()->create();

    $this->from(route('users.index'))
        ->patch(route('users.update-status', $target), ['is_active' => 'maybe'])
        ->assertSessionHasErrors('is_active');

    $this->assertDatabaseHas('users', ['id' => $target->id, 'is_active' => true]);
});

test('renders the create user page with available roles', function () {
    User::factory()->asUser()->create();

    $this->get(route('users.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('users/create')
            ->where('roles', ['admin', 'user'])
        );
});

test('superadmins see every role on the create user page', function () {
    $actor = User::factory()->asSuperadmin()->create(['email' => 'actor@example.com']);
    User::factory()->asUser()->create();

    $this->actingAs($actor)
        ->get(route('users.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('roles', ['superadmin', 'admin', 'user'])
        );
});

test('ordinary users cannot open the create user page', function () {
    $user = User::factory()->asUser()->create();

    $this->actingAs($user)
        ->get(route('users.create'))
        ->assertForbidden();
});

test('creates a user with the given roles', function () {
    User::factory()->asUser()->create();

    $this->from(route('users.index'))
        ->post(route('users.store'), [
            'name' => 'New Person',
            'email' => 'new@example.com',
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
            'roles' => ['admin', 'user'],
        ])
        ->assertRedirect(route('users.index'));

    $this->assertDatabaseHas('users', ['email' => 'new@example.com']);

    $created = User::query()->where('email', 'new@example.com')->firstOrFail();

    expect($created->roles->pluck('name')->sort()->values()->all())->toBe(['admin', 'user']);
    expect(Hash::check('secret-password', $created->password))->toBeTrue();
});

test('admins cannot assign the superadmin role', function () {
    $this->from(route('users.index'))
        ->post(route('users.store'), [
            'name' => 'New Person',
            'email' => 'new@example.com',
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
            'roles' => ['superadmin'],
        ])
        ->assertSessionHasErrors('roles.0');

    $this->assertDatabaseMissing('users', ['email' => 'new@example.com']);
});

test('requires at least one role when creating a user', function () {
    $this->from(route('users.index'))
        ->post(route('users.store'), [
            'name' => 'New Person',
            'email' => 'new@example.com',
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
        ])
        ->assertSessionHasErrors('roles');

    $this->assertDatabaseMissing('users', ['email' => 'new@example.com']);
});

test('ordinary users cannot create users', function () {
    $user = User::factory()->asUser()->create();

    $this->actingAs($user)
        ->from(route('users.index'))
        ->post(route('users.store'), [
            'name' => 'New Person',
            'email' => 'new@example.com',
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
            'roles' => ['user'],
        ])
        ->assertForbidden();

    $this->assertDatabaseMissing('users', ['email' => 'new@example.com']);
});

test('superadmins can create superadmins', function () {
    $actor = User::factory()->asSuperadmin()->create(['email' => 'actor@example.com']);

    $this->actingAs($actor)
        ->from(route('users.index'))
        ->post(route('users.store'), [
            'name' => 'New Boss',
            'email' => 'boss@example.com',
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
            'roles' => ['superadmin'],
        ])
        ->assertRedirect(route('users.index'));

    $created = User::query()->where('email', 'boss@example.com')->firstOrFail();

    expect($created->hasRole('superadmin'))->toBeTrue();
    expect($created->is_active)->toBeTrue();
});
