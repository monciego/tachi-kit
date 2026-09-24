<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('creates a verified superadmin from options', function () {
    $this->artisan('tachi:superadmin', [
        '--name' => 'Jane Owner',
        '--email' => 'jane@example.com',
        '--password' => 'correct-horse-battery',
    ])->assertSuccessful();

    $user = User::query()->where('email', 'jane@example.com')->sole();

    expect($user->name)->toBe('Jane Owner')
        ->and($user->isSuperadmin())->toBeTrue()
        ->and($user->email_verified_at)->not->toBeNull()
        ->and(Hash::check('correct-horse-battery', $user->password))->toBeTrue();
});

test('prompts for missing details', function () {
    $this->artisan('tachi:superadmin')
        ->expectsQuestion('Name', 'Jane Owner')
        ->expectsQuestion('Email address', 'jane@example.com')
        ->expectsQuestion('Password', 'correct-horse-battery')
        ->assertSuccessful();

    expect(User::query()->where('email', 'jane@example.com')->sole()->isSuperadmin())->toBeTrue();
});

test('refuses invalid or duplicate details', function (array $options) {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->artisan('tachi:superadmin', [
        '--name' => 'Jane Owner',
        '--password' => 'correct-horse-battery',
        ...$options,
    ])->assertFailed();

    expect(User::query()->count())->toBe(1);
})->with([
    'invalid email' => [['--email' => 'not-an-email']],
    'duplicate email' => [['--email' => 'taken@example.com']],
]);
