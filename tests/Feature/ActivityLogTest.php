<?php

use App\Actions\Fortify\ResetUserPassword;
use App\Enums\ActivityEvent;
use App\Enums\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Collection;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Activitylog\Models\Activity;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

/**
 * The activity entries recorded for the given event, oldest first.
 *
 * @return Collection<int, Activity>
 */
function activitiesFor(ActivityEvent $event): Collection
{
    return Activity::query()->where('event', $event->value)->oldest('id')->get();
}

describe('user management', function () {
    beforeEach(function () {
        $this->admin = User::factory()->asAdmin()->create(['name' => 'John Administrator']);
        $this->actingAs($this->admin);
    });

    test('creating a user logs the user and each assigned role', function () {
        $this->post(route('users.store'), [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'roles' => ['user'],
        ])->assertRedirect(route('users.index'));

        $jane = User::query()->where('email', 'jane@example.com')->sole();
        $created = activitiesFor(ActivityEvent::UserCreated)->sole();

        expect($created->subject->is($jane))->toBeTrue()
            ->and($created->causer->is($this->admin))->toBeTrue()
            ->and($created->getProperty('subject_name'))->toBe('Jane Doe')
            ->and(activitiesFor(ActivityEvent::RoleAssigned)->sole()->getProperty('role'))->toBe('user');
    });

    test('updating a user logs changed fields, password and role changes', function () {
        $jane = User::factory()->asUser()->create(['name' => 'Jane Doe']);

        $this->put(route('users.update', $jane), [
            'name' => 'Jane Smith',
            'email' => $jane->email,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
            'roles' => ['admin'],
        ])->assertRedirect(route('users.index'));

        expect(activitiesFor(ActivityEvent::UserUpdated)->sole()->getProperty('changed'))->toBe(['name'])
            ->and(activitiesFor(ActivityEvent::PasswordChanged))->toHaveCount(1)
            ->and(activitiesFor(ActivityEvent::RoleAssigned)->sole()->getProperty('role'))->toBe('admin')
            ->and(activitiesFor(ActivityEvent::RoleRemoved)->sole()->getProperty('role'))->toBe('user');
    });

    test('saving a user without changes logs nothing', function () {
        $jane = User::factory()->asUser()->create();

        $this->put(route('users.update', $jane), [
            'name' => $jane->name,
            'email' => $jane->email,
            'roles' => ['user'],
        ])->assertRedirect(route('users.index'));

        expect(Activity::query()->count())->toBe(0);
    });

    test('changing status logs activation and deactivation once', function () {
        $jane = User::factory()->asUser()->create();

        $this->patch(route('users.update-status', $jane), ['is_active' => false]);
        $this->patch(route('users.update-status', $jane), ['is_active' => false]);
        $this->patch(route('users.update-status', $jane), ['is_active' => true]);

        expect(activitiesFor(ActivityEvent::UserDeactivated))->toHaveCount(1)
            ->and(activitiesFor(ActivityEvent::UserActivated))->toHaveCount(1);
    });

    test('deleting users logs one entry per deleted user', function () {
        $jane = User::factory()->asUser()->create();
        [$first, $second] = User::factory()->asUser()->count(2)->create();

        $this->delete(route('users.destroy', $jane));
        $this->post(route('users.bulk-delete'), ['ids' => [$first->id, $second->id, $this->admin->id]]);

        expect(activitiesFor(ActivityEvent::UserDeleted)->pluck('subject_id')->all())
            ->toBe([$jane->id, $first->id, $second->id]);
    });
});

test('changing role permissions logs what was added and removed', function () {
    $role = Role::query()->create(['name' => 'Editor']);
    $role->givePermissionTo(Permission::UsersView->value);

    $this->actingAs(User::factory()->asSuperadmin()->create())
        ->put(route('roles.update', $role), [
            'name' => 'Editor',
            'permissions' => [Permission::RolesView->value],
        ]);

    $activity = activitiesFor(ActivityEvent::PermissionsChanged)->sole();

    expect($activity->getProperty('added'))->toBe([Permission::RolesView->value])
        ->and($activity->getProperty('removed'))->toBe([Permission::UsersView->value]);
});

test('renaming a role without changing permissions logs nothing', function () {
    $role = Role::query()->create(['name' => 'Editor']);
    $role->givePermissionTo(Permission::UsersView->value);

    $this->actingAs(User::factory()->asSuperadmin()->create())
        ->put(route('roles.update', $role), [
            'name' => 'Reviewer',
            'permissions' => [Permission::UsersView->value],
        ]);

    expect(Activity::query()->count())->toBe(0);
});

describe('own account', function () {
    test('profile updates, password changes and account deletion are logged', function () {
        $user = User::factory()->create();

        $this->actingAs($user)->patch(route('profile.update'), ['name' => 'New Name', 'email' => $user->email]);
        $this->actingAs($user)->put(route('user-password.update'), [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);
        $this->actingAs($user)->delete(route('profile.destroy'), ['password' => 'new-password']);

        expect(activitiesFor(ActivityEvent::UserUpdated)->sole()->causer_id)->toBe($user->id)
            ->and(activitiesFor(ActivityEvent::PasswordChanged))->toHaveCount(1)
            ->and(activitiesFor(ActivityEvent::UserDeleted)->sole()->subject_id)->toBe($user->id);
    });

    test('registration logs the new user as the actor', function () {
        config(['tachi.registration.public' => true]);

        $this->post(route('register.store'), [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $activity = activitiesFor(ActivityEvent::UserCreated)->sole();

        expect($activity->causer_id)->toBe($activity->subject_id)
            ->and(ActivityEvent::UserCreated->describe($activity))->toBe('Created their account');
    });

    test('password resets are logged', function () {
        $user = User::factory()->create();

        app(ResetUserPassword::class)->reset($user, [
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        expect(ActivityEvent::PasswordChanged->describe(activitiesFor(ActivityEvent::PasswordChanged)->sole()))
            ->toBe('Reset their password');
    });
});

describe('authentication', function () {
    test('successful logins and logouts are logged', function () {
        $user = User::factory()->create();

        $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password']);
        $this->post(route('logout'));

        expect(activitiesFor(ActivityEvent::Login)->sole()->causer_id)->toBe($user->id)
            ->and(activitiesFor(ActivityEvent::Logout)->sole()->causer_id)->toBe($user->id);
    });

    test('failed logins record the email but never the password', function () {
        $user = User::factory()->create(['email' => 'jane@example.com']);

        $this->post(route('login.store'), ['email' => 'jane@example.com', 'password' => 'wrong-password']);
        $this->post(route('login.store'), ['email' => 'nobody@example.com', 'password' => 'wrong-password']);

        [$known, $unknown] = activitiesFor(ActivityEvent::LoginFailed)->all();

        expect($known->causer_id)->toBe($user->id)
            ->and($unknown->causer_id)->toBeNull()
            ->and(ActivityEvent::LoginFailed->describe($unknown))->toBe('Failed login attempt for nobody@example.com')
            ->and(json_encode($known->properties))->not->toContain('wrong-password');
    });

    test('login attempts on inactive accounts are logged', function () {
        $user = User::factory()->inactive()->create();

        $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password']);

        expect(activitiesFor(ActivityEvent::LoginFailed)->sole()->getProperty('reason'))->toBe('inactive')
            ->and(activitiesFor(ActivityEvent::Login))->toHaveCount(0);
    });
});

describe('activity log page', function () {
    test('guests are redirected to the login page', function () {
        $this->get(route('activity.index'))->assertRedirect(route('login'));
    });

    test('forbids users without the activity.view permission, including admins', function () {
        $this->actingAs(User::factory()->asAdmin()->create())
            ->get(route('activity.index'))
            ->assertForbidden();
    });

    test('superadmins see readable entries', function () {
        $superadmin = User::factory()->asSuperadmin()->create(['name' => 'John Administrator']);
        $jane = User::factory()->create(['name' => 'Jane Doe']);
        ActivityEvent::UserDeactivated->log($jane, causer: $superadmin);
        $jane->delete();

        $this->actingAs($superadmin)
            ->get(route('activity.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('activity/index')
                ->has('activities.data', 1)
                ->where('activities.data.0.causer.name', 'John Administrator')
                ->where('activities.data.0.description', 'Deactivated user Jane Doe')
                ->where('activities.data.0.event', 'user.deactivated')
                ->has('eventOptions', count(ActivityEvent::cases()))
            );
    });

    test('hides superadmin activity from other viewers', function () {
        $superadmin = User::factory()->asSuperadmin()->create();
        $jane = User::factory()->create(['name' => 'Jane Doe']);
        $viewer = User::factory()->asAdmin()->create();
        $viewer->givePermissionTo(Permission::ActivityView->value);

        ActivityEvent::Login->log(causer: $superadmin);
        ActivityEvent::UserUpdated->log($superadmin, causer: $viewer);
        ActivityEvent::UserActivated->log($jane, causer: $viewer);
        ActivityEvent::LoginFailed->log(properties: ['email' => 'nobody@example.com']);

        $this->actingAs($viewer)
            ->get(route('activity.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('activities.data', 2)
                ->where('activities.data.0.event', 'auth.login_failed')
                ->where('activities.data.0.causer', null)
                ->where('activities.data.1.event', 'user.activated')
            );
    });

    test('filters by event and searches by name or email', function () {
        $superadmin = User::factory()->asSuperadmin()->create();
        $jane = User::factory()->create(['name' => 'Jane Doe']);
        ActivityEvent::UserActivated->log($jane, causer: $superadmin);
        ActivityEvent::LoginFailed->log(properties: ['email' => 'nobody@example.com']);

        $this->actingAs($superadmin)
            ->get(route('activity.index', ['event' => 'auth.login_failed']))
            ->assertInertia(fn (Assert $page) => $page->has('activities.data', 1)->where('activities.data.0.event', 'auth.login_failed'));

        $this->actingAs($superadmin)
            ->get(route('activity.index', ['search' => 'jane']))
            ->assertInertia(fn (Assert $page) => $page->has('activities.data', 1)->where('activities.data.0.event', 'user.activated'));
    });
});
