<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Number of months shown in the sign-ups chart, including the current one.
     */
    private const SIGNUP_MONTHS = 12;

    /**
     * Number of rows shown in the recent users table.
     */
    private const RECENT_USERS_LIMIT = 5;

    /**
     * Show the dashboard. User analytics are only loaded for viewers who may
     * list users, and are deferred so the page shell renders immediately.
     */
    public function __invoke(Request $request): Response
    {
        $viewer = $request->user();

        if ($viewer->cannot('viewAny', User::class)) {
            return Inertia::render('dashboard');
        }

        return Inertia::render('dashboard', [
            'stats' => Inertia::defer(fn (): array => $this->stats($viewer)),
            'signups' => Inertia::defer(fn (): array => $this->signups($viewer)),
            'recentUsers' => Inertia::defer(fn (): array => $this->recentUsers($viewer)),
        ]);
    }

    /**
     * Headline user counts for the stat cards.
     *
     * @return array{total_users: int, active_users: int, inactive_users: int, new_this_month: int, new_last_month: int}
     */
    private function stats(User $viewer): array
    {
        $users = fn (): Builder => User::query()->visibleTo($viewer);
        $thisMonth = now()->startOfMonth();

        return [
            'total_users' => $users()->count(),
            'active_users' => $users()->where('is_active', true)->count(),
            'inactive_users' => $users()->where('is_active', false)->count(),
            'new_this_month' => $users()->where('created_at', '>=', $thisMonth)->count(),
            'new_last_month' => $users()
                ->where('created_at', '>=', $thisMonth->subMonth())
                ->where('created_at', '<', $thisMonth)
                ->count(),
        ];
    }

    /**
     * New users per month, oldest first, with empty months filled with zero.
     *
     * @return array<int, array{month: string, total: int}>
     */
    private function signups(User $viewer): array
    {
        $start = CarbonImmutable::now()->startOfMonth()->subMonths(self::SIGNUP_MONTHS - 1);

        $month = match (DB::connection()->getDriverName()) {
            'sqlite' => "strftime('%Y-%m', created_at)",
            'pgsql' => "to_char(created_at, 'YYYY-MM')",
            'sqlsrv' => "format(created_at, 'yyyy-MM')",
            default => "date_format(created_at, '%Y-%m')",
        };

        $totals = User::query()
            ->visibleTo($viewer)
            ->where('created_at', '>=', $start)
            ->selectRaw("{$month} as month, count(*) as total")
            ->groupByRaw($month)
            ->pluck('total', 'month');

        return collect(range(0, self::SIGNUP_MONTHS - 1))
            ->map(function (int $offset) use ($start, $totals): array {
                $month = $start->addMonths($offset)->format('Y-m');

                return ['month' => $month, 'total' => (int) ($totals[$month] ?? 0)];
            })
            ->all();
    }

    /**
     * The most recently created users.
     *
     * @return array<int, array{id: int, name: string, email: string, roles: array<int, string>, is_active: bool, created_at: string|null}>
     */
    private function recentUsers(User $viewer): array
    {
        return User::query()
            ->visibleTo($viewer)
            ->with('roles')
            ->latest()
            ->latest('id')
            ->limit(self::RECENT_USERS_LIMIT)
            ->get()
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->map(fn (Role $role): string => $role->name)->all(),
                'is_active' => $user->is_active,
                'created_at' => $user->created_at?->toIso8601String(),
            ])
            ->values()
            ->all();
    }
}
