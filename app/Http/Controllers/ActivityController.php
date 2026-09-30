<?php

namespace App\Http\Controllers;

use App\Enums\ActivityEvent;
use App\Enums\RoleName;
use App\Http\Requests\DataTableRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityController extends Controller
{
    use AuthorizesRequests;

    /**
     * List activity log entries, newest first, with search and an event filter.
     */
    public function index(DataTableRequest $request): Response|RedirectResponse
    {
        $this->authorize('viewAny', Activity::class);

        $viewer = $request->user();
        $search = $request->search();
        $events = $request->filter('event');

        $activities = Activity::query()
            ->with('causer')
            ->when(! $viewer->isSuperadmin(), fn (Builder $query) => $this->withoutSuperadminActivity($query))
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where(function (Builder $sub) use ($search) {
                    $sub->where('properties->causer_name', 'like', "%{$search}%")
                        ->orWhere('properties->subject_name', 'like', "%{$search}%")
                        ->orWhere('properties->email', 'like', "%{$search}%");
                });
            })
            ->when($events->isNotEmpty(), fn (Builder $query) => $query->whereIn('event', $events))
            ->latest()
            ->latest('id')
            ->paginate($request->perPage())
            ->withQueryString();

        if ($request->isPastLastPage($activities)) {
            return to_route('activity.index', $request->except('page'));
        }

        return Inertia::render('activity/index', [
            'activities' => $activities->through(fn (Activity $activity): array => [
                'id' => $activity->id,
                'event' => $activity->event,
                'description' => ActivityEvent::tryFrom((string) $activity->event)?->describe($activity) ?? $activity->description,
                'causer' => $this->causer($activity),
                'created_at' => $activity->created_at?->toIso8601String(),
            ]),
            'eventOptions' => ActivityEvent::options(),
        ]);
    }

    /**
     * Hide entries whose actor or subject is a superadmin, matching how
     * superadmins are hidden from everyone else across the app.
     *
     * @param  Builder<Activity>  $query
     */
    private function withoutSuperadminActivity(Builder $query): void
    {
        $morphClass = (new User)->getMorphClass();
        $superadminIds = User::withTrashed()->role(RoleName::Superadmin->value)->pluck('id');

        foreach (['causer', 'subject'] as $relation) {
            $query->where(function (Builder $sub) use ($relation, $morphClass, $superadminIds) {
                $sub->whereNull("{$relation}_type")
                    ->orWhere("{$relation}_type", '!=', $morphClass)
                    ->orWhereNotIn("{$relation}_id", $superadminIds);
            });
        }
    }

    /**
     * The actor shown for an entry: the live user when they still exist,
     * otherwise the name stored at the time, or null for anonymous entries.
     *
     * @return array{name: string, avatar: string|null}|null
     */
    private function causer(Activity $activity): ?array
    {
        if ($activity->causer instanceof User) {
            return ['name' => $activity->causer->name, 'avatar' => $activity->causer->avatar];
        }

        $name = $activity->getProperty('causer_name');

        return is_string($name) ? ['name' => $name, 'avatar' => null] : null;
    }
}
