<?php

namespace App\Http\Middleware;

use App\Enums\Permission;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Spatie\Permission\Exceptions\PermissionDoesNotExist;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $roles = $user
            ? $user->roles
                ->map(fn ($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'is_system_role' => $role->isSystemRole(),
                ])
                ->values()
                ->all()
            : [];

        $can = $user
            ? collect(Permission::values())
                ->mapWithKeys(function (string $name) use ($user) {
                    try {
                        return [$name => $user->can($name)];
                    } catch (PermissionDoesNotExist) {
                        return [$name => false];
                    }
                })
                ->all()
            : [];

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
                'roles' => $roles,
                'can' => $can,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'canRegister' => config('tachi.registration.public'),
        ];
    }
}
