<?php

use App\Models\User;

it('assigns a user code when creating a user', function () {
    $user = User::factory()->create();

    expect($user->user_code)->toMatch('/^USR-\d{4}$/');
});

it('keeps an explicitly provided user code', function () {
    $user = User::factory()->create(['user_code' => 'USR-0001']);

    expect($user->user_code)->toBe('USR-0001');
});

it('generates sequential user codes', function () {
    $first = User::factory()->create(['user_code' => 'USR-0001']);
    $second = User::factory()->create();

    expect($first->user_code)->toBe('USR-0001')
        ->and($second->user_code)->toBe('USR-0002');
});

it('generates a unique code when an old user keeps one as the highest', function () {
    User::factory()->create(['user_code' => 'USR-0002']);

    $user = User::factory()->create();

    expect($user->user_code)->toBe('USR-0003');
});

it('supports a custom prefix', function () {
    User::factory()->create(['user_code' => 'MEM-0001']);

    expect(User::generateUserCode('MEM-'))->toBe('MEM-0002')
        ->and(User::findByCode('MEM-0001'))->toBeInstanceOf(User::class);
});

it('pads shorter numbers to the given length', function () {
    $user = User::factory()->create(['user_code' => 'USR-0042']);

    expect($user->user_code)->toBe('USR-0042');
});

it('throws when the code length is less than one', function () {
    expect(fn () => User::generateUserCode(length: 0))
        ->toThrow(InvalidArgumentException::class);
});

it('throws when the sequence for a prefix is exhausted', function () {
    User::factory()->create(['user_code' => 'USR-9999']);

    expect(fn () => User::generateUserCode(length: 4))
        ->toThrow(RuntimeException::class);
});

it('can look a user up by their code', function () {
    $user = User::factory()->create();

    expect(User::findByCode($user->user_code))->toBeInstanceOf(User::class)
        ->and(User::findByCode('NOPE-0001'))->toBeNull();
});
