<?php

use App\Console\Commands\GenerateAccessTypes;
use Illuminate\Support\Facades\File;

afterEach(function () {
    File::delete(base_path('storage/framework/testing/access.generated.ts'));
});

test('the committed access types match the PHP enums', function () {
    $this->artisan('tachi:types', ['--check' => true])->assertSuccessful();
});

test('writes the access types to the given path', function () {
    $this->artisan('tachi:types', ['--path' => 'storage/framework/testing/access.generated.ts'])
        ->assertSuccessful();

    expect(File::get(base_path('storage/framework/testing/access.generated.ts')))
        ->toBe(app(GenerateAccessTypes::class)->render())
        ->toContain("USERS_VIEW: 'users.view',")
        ->toContain("SUPERADMIN: 'superadmin',")
        ->toContain("'users.status': 'Change User Status',");
});

test('check fails when the access types are stale', function () {
    File::ensureDirectoryExists(base_path('storage/framework/testing'));
    File::put(base_path('storage/framework/testing/access.generated.ts'), '// stale');

    $this->artisan('tachi:types', ['--check' => true, '--path' => 'storage/framework/testing/access.generated.ts'])
        ->assertFailed();
});
