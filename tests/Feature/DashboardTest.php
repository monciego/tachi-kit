<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->travelTo(now()->setDate(2026, 9, 15)->startOfDay());
});

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('users without the users.view permission get no analytics', function () {
    $user = User::factory()->asUser()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->missing('stats')
            ->missing('signups')
            ->missing('recentUsers')
        );
});

test('admins get deferred stats that exclude superadmins', function () {
    $admin = User::factory()->asAdmin()->create(['created_at' => now()->subYear()]);
    User::factory()->asSuperadmin()->create();
    User::factory()->asUser()->count(2)->create();
    User::factory()->asUser()->inactive()->create(['created_at' => now()->subMonth()]);

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->missing('stats')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->where('stats', [
                    'total_users' => 4,
                    'active_users' => 3,
                    'inactive_users' => 1,
                    'new_this_month' => 2,
                    'new_last_month' => 1,
                ])
            )
        );
});

test('superadmins see superadmin accounts in the stats', function () {
    $superadmin = User::factory()->asSuperadmin()->create();
    User::factory()->asUser()->create();

    $this->actingAs($superadmin)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->where('stats.total_users', 2)
            )
        );
});

test('signups cover the last twelve months with empty months as zero', function () {
    $admin = User::factory()->asAdmin()->create(['created_at' => now()->subYears(2)]);
    User::factory()->asUser()->count(2)->create(['created_at' => now()->subMonths(3)]);
    User::factory()->asUser()->create();

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('signups', 12)
                ->where('signups.0', ['month' => '2025-10', 'total' => 0])
                ->where('signups.8', ['month' => '2026-06', 'total' => 2])
                ->where('signups.11', ['month' => '2026-09', 'total' => 1])
            )
        );
});

test('recent users lists the five newest visible users', function () {
    $admin = User::factory()->asAdmin()->create(['created_at' => now()->subYear()]);
    User::factory()->asSuperadmin()->create();
    User::factory()->asUser()
        ->count(6)
        ->sequence(fn ($sequence) => [
            'name' => "Member {$sequence->index}",
            'created_at' => now()->subDays(10 - $sequence->index),
        ])
        ->create();

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('recentUsers', 5)
                ->where('recentUsers.0.name', 'Member 5')
                ->where('recentUsers.0.roles', ['user'])
                ->where('recentUsers.0.is_active', true)
                ->where('recentUsers.4.name', 'Member 1')
            )
        );
});
