<?php

namespace Database\Factories;

use App\Enums\RoleName;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'is_active' => true,
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ];
    }

    /**
     * Indicate that the user should be assigned the given role.
     */
    public function withRole(RoleName|string $role): static
    {
        return $this->afterCreating(function (User $user) use ($role) {
            $user->assignRole(Role::firstOrCreate(['name' => $role instanceof RoleName ? $role->value : $role]));
        });
    }

    /**
     * Indicate that the user should be assigned the admin role.
     */
    public function asAdmin(): static
    {
        return $this->withRole(RoleName::Admin);
    }

    /**
     * Indicate that the user should be assigned the superadmin role.
     */
    public function asSuperadmin(): static
    {
        return $this->withRole(RoleName::Superadmin);
    }

    /**
     * Indicate that the user should be assigned the standard user role.
     */
    public function asUser(): static
    {
        return $this->withRole(RoleName::User);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the account is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the model has two-factor authentication configured.
     */
    public function withTwoFactor(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_secret' => encrypt('secret'),
            'two_factor_recovery_codes' => encrypt(json_encode(['recovery-code-1'])),
            'two_factor_confirmed_at' => now(),
        ]);
    }
}
