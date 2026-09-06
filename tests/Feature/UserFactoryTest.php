<?php

use App\Models\Role;
use App\Models\User;

test('withRole state assigns the role to the created user', function () {
    $user = User::factory()->withRole('custom-role')->create();

    expect($user->fresh()->hasRole('custom-role'))->toBeTrue()
        ->and(Role::where('name', 'custom-role')->exists())->toBeTrue();
});

test('asAdmin and asUser states assign the system roles', function () {
    $admin = User::factory()->asAdmin()->create();
    $user = User::factory()->asUser()->create();

    expect($admin->fresh()->hasRole('admin'))->toBeTrue();
    expect($user->fresh()->hasRole('user'))->toBeTrue();
});
