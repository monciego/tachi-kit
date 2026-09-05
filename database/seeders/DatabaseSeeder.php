<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * The demo users to seed alongside their roles.
     *
     * @var array<int, array{name: string, email: string, role: string}>
     */
    protected array $users = [
        ['name' => 'Superadmin', 'email' => 'superadmin@tachikit.com', 'role' => 'superadmin'],
        ['name' => 'Administrator', 'email' => 'administrator@tachikit.com', 'role' => 'admin'],
        ['name' => 'Test User', 'email' => 'testuser@tachikit.com', 'role' => 'user'],
    ];

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
        ]);

        foreach ($this->users as $attributes) {
            $user = User::query()->firstOrCreate(
                ['email' => $attributes['email']],
                [
                    'name' => $attributes['name'],
                    'password' => 'password',
                    'email_verified_at' => now(),
                ],
            );

            $user->assignRole($attributes['role']);
        }
    }
}
