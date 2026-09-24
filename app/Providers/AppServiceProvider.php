<?php

namespace App\Providers;

use App\Models\Role;
use App\Models\User;
use App\Policies\RolePolicy;
use App\Policies\UserPolicy;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Role::class, RolePolicy::class);
        // Superadmin bypasses all authorization checks, except self-update,
        // updateStatus and role deletion. There the policies still apply so a
        // superadmin cannot demote themselves, change their own / another
        // superadmin's account status, or delete a system or in-use role.
        Gate::before(function (User $user, string $ability, array $arguments) {
            if ($user->hasRole('superadmin')) {
                if ($ability === 'updateStatus') {
                    return null;
                }

                if ($ability === 'delete' && ($arguments[0] ?? null) instanceof Role) {
                    return null;
                }

                if ($ability === 'update') {
                    $subject = $arguments[0] ?? null;

                    if ($subject instanceof User && $subject->is($user)) {
                        return null;
                    }
                }

                return true;
            }
        });

        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
