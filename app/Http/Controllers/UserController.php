<?php

namespace App\Http\Controllers;

use App\Enums\Permission;
use App\Enums\RoleName;
use App\Http\Requests\DataTableRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    use AuthorizesRequests;

    /**
     * List users with server-side search, filtering, sorting and pagination.
     */
    public function index(DataTableRequest $request): Response|RedirectResponse
    {
        $this->authorize('viewAny', User::class);

        $search = $request->search();
        $roles = $request->filter('role');
        $statuses = $request->filter('status');

        $wantsActive = $statuses->contains('active');
        $wantsInactive = $statuses->contains('inactive');

        $users = User::query()
            ->with('roles')
            ->visibleTo($request->user())
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
                [$request->user()->id, $request->user()->getMorphClass(), RoleName::Superadmin->value],
            )
            ->orderBy($request->sortColumn(['id', 'name', 'email', 'created_at'], 'created_at'), $request->sortDirection())
            ->paginate($request->perPage())
            ->withQueryString();

        if ($request->isPastLastPage($users)) {
            return to_route('users.index', $request->except('page'));
        }

        $users = $users->through(fn (User $user): array => [
            'id' => $user->id,
            'user_code' => $user->user_code,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'roles' => $user->roles->pluck('name')->all(),
            'created_at' => $user->created_at?->toIso8601String(),
            'is_active' => (bool) $user->is_active,
            'deletable' => $user->id !== $request->user()->id && ! $user->isSuperadmin(),
        ]);

        return Inertia::render('users/index', [
            'users' => $users,
            'roleOptions' => $this->availableRoleNames(),
        ]);
    }

    /**
     * Show the create user form.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('users/create', [
            'roles' => $this->availableRoleNames(),
        ]);
    }

    /**
     * Create a new user.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->authorize('create', User::class);

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
     * Show the edit user form.
     */
    public function edit(Request $request, User $user): Response
    {
        $this->authorize('update', $user);

        return Inertia::render('users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames()->sort()->values()->all(),
                'is_superadmin' => $user->isSuperadmin(),
            ],
            'roles' => $this->availableRoleNames(),
        ]);
    }

    /**
     * Update a user.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->authorize('update', [$user, $request]);

        $data = $request->validated();

        $attributes = [
            'name' => $data['name'],
            'email' => $data['email'],
        ];

        if (! empty($data['password'])) {
            $attributes['password'] = $data['password'];
        }

        $user->update($attributes);
        $user->syncRoles($data['roles']);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('User :name updated.', ['name' => $user->name]),
        ]);

        return to_route('users.index');
    }

    /**
     * Delete the given user.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

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

        $this->authorize('updateStatus', [$user, $request]);

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
        abort_unless($request->user()->checkPermissionTo(Permission::UsersDelete->value), 403);

        $ids = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'distinct', 'exists:users,id'],
        ])['ids'];

        $ids = User::query()
            ->whereIn('id', $ids)
            ->where('id', '!=', $request->user()->id)
            ->whereDoesntHave('roles', fn ($role) => $role->where('name', RoleName::Superadmin->value))
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
        /** @var User|null $user */
        $user = Auth::user();

        return Role::query()
            ->when(! $user?->isSuperadmin(), fn ($query) => $query->where('name', '!=', RoleName::Superadmin->value))
            ->systemRolesFirst()
            ->orderBy('name')
            ->pluck('name')
            ->all();
    }
}
