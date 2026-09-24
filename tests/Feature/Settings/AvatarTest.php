<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

test('users can upload an avatar', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('avatar.update'), ['avatar' => UploadedFile::fake()->image('me.png', 200, 200)])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'))
        ->assertInertiaFlash('toast', ['type' => 'success', 'message' => 'Avatar updated.']);

    $user->refresh();

    Storage::disk('public')->assertExists($user->avatar_path);
    expect($user->avatar)->toBe(Storage::disk('public')->url($user->avatar_path))
        ->and($user->toArray())->toHaveKey('avatar')->not->toHaveKey('avatar_path');
});

test('uploading a new avatar deletes the previous file', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('avatar.update'), ['avatar' => UploadedFile::fake()->image('old.png')]);
    $oldPath = $user->refresh()->avatar_path;

    $this->actingAs($user)->post(route('avatar.update'), ['avatar' => UploadedFile::fake()->image('new.png')]);

    Storage::disk('public')->assertMissing($oldPath);
    Storage::disk('public')->assertExists($user->refresh()->avatar_path);
});

test('users can remove their avatar', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('avatar.update'), ['avatar' => UploadedFile::fake()->image('me.png')]);
    $path = $user->refresh()->avatar_path;

    $this->actingAs($user)
        ->delete(route('avatar.destroy'))
        ->assertRedirect(route('profile.edit'));

    Storage::disk('public')->assertMissing($path);
    expect($user->refresh()->avatar_path)->toBeNull()
        ->and($user->avatar)->toBeNull();
});

test('rejects files that are not images or are too large', function (UploadedFile $file) {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('avatar.update'), ['avatar' => $file])
        ->assertSessionHasErrors('avatar');

    expect($user->refresh()->avatar_path)->toBeNull();
})->with([
    'pdf' => fn () => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf'),
    'gif' => fn () => UploadedFile::fake()->image('me.gif'),
    'too large' => fn () => UploadedFile::fake()->image('me.png')->size(2049),
]);

test('guests cannot upload avatars', function () {
    $this->post(route('avatar.update'), ['avatar' => UploadedFile::fake()->image('me.png')])
        ->assertRedirect(route('login'));
});
