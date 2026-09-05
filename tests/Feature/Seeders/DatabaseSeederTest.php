<?php

use App\Models\Role;
use App\Models\User;

test('seeder creates a demo user for each system role', function () {
    $this->seed();

    expect(Role::count())->toBe(3)
        ->and(User::count())->toBe(3);

    $superadmin = User::where('email', 'superadmin@tachikit.com')->sole();
    $admin = User::where('email', 'administrator@tachikit.com')->sole();
    $user = User::where('email', 'testuser@tachikit.com')->sole();

    expect($superadmin->hasRole('superadmin'))->toBeTrue();
    expect($admin->hasRole('admin'))->toBeTrue();
    expect($admin->hasRole('user'))->toBeFalse();
    expect($user->hasRole('user'))->toBeTrue();
});

test('seeder can be re-run without creating duplicate records', function () {
    $this->seed();
    $this->seed();

    expect(User::count())->toBe(3)
        ->and(Role::count())->toBe(3);
});
