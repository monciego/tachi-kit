<?php

namespace App\Http\Controllers;

use App\Enums\Permission;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): Response|RedirectResponse
    {
        $this->authorize('viewAny', Role::class);

        $perPage = (int) $request->query('per_page', 10);

        if (! in_array($perPage, [10, 20, 50, 100], true)) {
            $perPage = 10;
        }

        $sorting = in_array($request->query('sort'), ['id', 'name'], true)
            ? $request->query('sort')
            : 'created_at';

        $direction = $request->query('direction') === 'asc' ? 'asc' : 'desc';

        $search = trim((string) $request->query('search', ''));

        $roles = Role::with([
            'permissions',
            'users' => function ($query) {
                $query->select('users.id', 'users.name', 'users.email')
                    ->limit(5);
            },
        ])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%");
                });
            })
            ->withCount('users')
            ->orderByRaw('CASE
                WHEN name = "superadmin" THEN 1
                WHEN name = "admin" THEN 2
                WHEN name = "user" THEN 3
                ELSE 6
            END')
            ->orderBy($sorting, $direction)
            ->paginate($perPage)
            ->withQueryString();

        if ($roles->total() > 0 && (int) $request->query('page', 1) > $roles->lastPage()) {
            return to_route('roles.index', $request->except('page'));
        }

        return Inertia::render('roles/index', [
            'roles' => RoleResource::collection($roles),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Role::class);

        return Inertia::render('roles/create', [
            'permissions' => Permission::values(),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $this->authorize('create', Role::class);

        $data = $request->validated();

        $role = Role::create(['name' => $data['name']]);
        $role->givePermissionTo($data['permissions']);

        return to_route('roles.index');
    }

    public function edit(Role $role): Response
    {
        $this->authorize('update', $role);

        $role->load('permissions');

        return Inertia::render('roles/edit', [
            'role' => RoleResource::make($role)->resolve(),
            'permissions' => Permission::values(),
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $data = $request->validated();

        $role->update(['name' => $data['name']]);
        $role->syncPermissions($data['permissions']);

        return to_route('roles.index');
    }

    public function destroy(Role $role): RedirectResponse
    {
        $this->authorize('delete', $role);

        $role->delete();

        return to_route('roles.index');
    }
}
