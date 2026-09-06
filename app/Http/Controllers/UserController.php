<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * List users with server-side search, filtering, sorting and pagination.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $perPage = (int) $request->query('per_page', 10);

        if (! in_array($perPage, [10, 20, 50, 100], true)) {
            $perPage = 10;
        }

        $sorting = in_array($request->query('sort'), ['id', 'name', 'email', 'created_at'], true)
            ? $request->query('sort')
            : 'created_at';

        $direction = $request->query('direction') === 'asc' ? 'asc' : 'desc';

        $search = trim((string) $request->query('search', ''));

        $roles = collect(explode(',', (string) $request->query('role', '')))
            ->map(fn (string $role) => trim($role))
            ->filter()
            ->unique()
            ->values();

        $statuses = collect(explode(',', (string) $request->query('status', '')))
            ->map(fn (string $status) => trim($status))
            ->filter()
            ->unique()
            ->values();

        $wantsActive = $statuses->contains('active');
        $wantsInactive = $statuses->contains('inactive');

        $users = User::query()
            ->with('roles')
            ->when(! $request->user()->hasRole('superadmin'), function ($query) {
                $query->whereDoesntHave('roles', fn ($role) => $role->where('name', 'superadmin'));
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($roles->isNotEmpty(), function ($query) use ($roles) {
                $query->whereHas('roles', fn ($role) => $role->whereIn('name', $roles));
            })
            ->when($wantsActive xor $wantsInactive, function ($query) use ($wantsActive) {
                $query->where('is_active', $wantsActive);
            })
            ->orderByRaw(
                'CASE WHEN users.id = ? THEN 0 WHEN EXISTS (
                    SELECT 1
                    FROM model_has_roles
                    INNER JOIN roles ON roles.id = model_has_roles.role_id
                    WHERE model_has_roles.model_id = users.id
                      AND model_has_roles.model_type = ?
                      AND roles.name = ?
                ) THEN 1 ELSE 2 END',
                [$request->user()->id, $request->user()->getMorphClass(), 'superadmin'],
            )
            ->orderBy($sorting, $direction)
            ->paginate($perPage)
            ->withQueryString();

        if ($users->total() > 0 && (int) $request->query('page', 1) > $users->lastPage()) {
            return to_route('users.index', $request->except('page'));
        }

        $users = $users->through(fn (User $user): array => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->roles->pluck('name')->all(),
            'created_at' => $user->created_at?->toIso8601String(),
            'is_active' => (bool) $user->is_active,
            'deletable' => $user->id !== $request->user()->id && ! $user->hasRole('superadmin'),
        ]);

        return Inertia::render('users/index', [
            'users' => $users,
            'roleOptions' => $this->availableRoleNames(),
            'canCreateUsers' => $request->user()->hasAnyRole(['superadmin', 'admin']),
        ]);
    }

    /**
     * Show the create user form.
     */
    public function create(Request $request): Response
    {
        // to be removed if permission is applied
        abort_unless($request->user()->hasAnyRole(['superadmin', 'admin']), 403);

        return Inertia::render('users/create', [
            'roles' => $this->availableRoleNames(),
        ]);
    }

    /**
     * Create a new user.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);

        $user->assignRole($data['roles']);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('User :name created.', ['name' => $user->name]),
        ]);

        return to_route('users.index');
    }

    /**
     * Delete the given user.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($user->hasRole('superadmin'), 403, __('Superadmin accounts cannot be deleted.'));

        abort_unless($user->id !== $request->user()->id, 403, __('You cannot delete your own account.'));

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User deleted.')]);

        return back();
    }

    /**
     * Update the given user's active status.
     */
    public function updateStatus(Request $request, User $user): RedirectResponse
    {
        $isActive = (bool) $request->validate([
            'is_active' => ['required', 'boolean'],
        ])['is_active'];

        abort_unless($user->id !== $request->user()->id, 403, __('You cannot change your own account status.'));

        abort_if(! $isActive && $user->hasRole('superadmin'), 403, __('Superadmin accounts cannot be deactivated.'));

        $user->update(['is_active' => $isActive]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $isActive ? __('User activated.') : __('User deactivated.'),
        ]);

        return back();
    }

    /**
     * Delete the selected users.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $ids = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'distinct', 'exists:users,id'],
        ])['ids'];

        $ids = User::query()
            ->whereIn('id', $ids)
            ->where('id', '!=', $request->user()->id)
            ->whereDoesntHave('roles', fn ($role) => $role->where('name', 'superadmin'))
            ->pluck('id')
            ->all();

        $deleted = User::query()->whereIn('id', $ids)->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => trans_choice(':count user deleted.|:count users deleted.', $deleted),
        ]);

        return back();
    }

    /**
     * Roles the current user may see and assign. Superadmins see every role;
     * everyone else can never see or assign the superadmin role. System roles
     * are listed first (superadmin, admin, user), then custom roles alphabetically.
     *
     * @return string[]
     */
    private function availableRoleNames(): array
    {
        return Role::query()
            ->when(! auth()->user()?->hasRole('superadmin'), fn ($query) => $query->where('name', '!=', 'superadmin'))
            ->orderByRaw("CASE WHEN name = 'superadmin' THEN 0 WHEN name = 'admin' THEN 1 WHEN name = 'user' THEN 2 ELSE 3 END")
            ->orderBy('name')
            ->pluck('name')
            ->all();
    }
}
