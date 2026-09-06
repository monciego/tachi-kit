<?php

use App\Models\Role;
use App\Models\User;

test('seeder creates the demo users with their roles', function () {
    $this->seed();

    expect(Role::count())->toBe(3)
        ->and(User::count())->toBe(54);

    $superadmin = User::where('email', 'superadmin@tachikit.com')->sole();
    $superadmin2 = User::where('email', 'superadmin2@tachikit.com')->sole();
    $administrator = User::where('email', 'administrator@tachikit.com')->sole();
    $secondAdmin = User::where('email', 'admin@tachikit.com')->sole();

    expect($superadmin->hasRole('superadmin'))->toBeTrue();
    expect($superadmin2->hasRole('superadmin'))->toBeTrue();
    expect($administrator->hasRole('admin'))->toBeTrue();
    expect($administrator->hasRole('user'))->toBeFalse();
    expect($secondAdmin->hasRole('admin'))->toBeTrue();

    expect(User::role('user')->count())->toBe(50);
});

test('seeder can be re-run without creating duplicate records', function () {
    $this->seed();
    $this->seed();

    expect(User::count())->toBe(54)
        ->and(Role::count())->toBe(3);
});
