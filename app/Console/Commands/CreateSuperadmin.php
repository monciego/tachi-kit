<?php

namespace App\Console\Commands;

use App\Enums\RoleName;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

#[Signature('tachi:superadmin {--name= : The account name} {--email= : The account email address} {--password= : The account password}')]
#[Description('Create a superadmin account (use this instead of demo seeding in production)')]
class CreateSuperadmin extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $attributes = [
            'name' => $this->option('name') ?: text(label: 'Name', required: true),
            'email' => $this->option('email') ?: text(label: 'Email address', required: true),
            'password' => $this->option('password') ?: password(label: 'Password', required: true),
        ];

        $validator = Validator::make($attributes, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'string', Password::default()],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->components->error($error);
            }

            return self::FAILURE;
        }

        $this->callSilently('db:seed', ['--class' => RolePermissionSeeder::class, '--force' => true]);

        $user = User::query()->create($validator->validated());
        $user->forceFill(['email_verified_at' => now()])->save();
        $user->assignRole(RoleName::Superadmin);

        $this->components->info("Superadmin [{$user->email}] created.");

        return self::SUCCESS;
    }
}
