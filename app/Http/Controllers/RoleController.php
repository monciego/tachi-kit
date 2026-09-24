<?php

namespace App\Http\Controllers;

use App\Enums\Permission;
use App\Http\Requests\DataTableRequest;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    use AuthorizesRequests;

    /**
     * List roles with server-side search, sorting and pagination.
     */
    public function index(DataTableRequest $request): Response|RedirectResponse
    {
        $this->authorize('viewAny', Role::class);

        $search = $request->search();

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
            ->systemRolesFirst()
            ->orderBy($request->sortColumn(['id', 'name'], 'created_at'), $request->sortDirection())
            ->paginate($request->perPage())
            ->withQueryString();

        if ($request->isPastLastPage($roles)) {
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

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Role :name created.', ['name' => $role->name]),
        ]);

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

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Role :name updated.', ['name' => $role->name]),
        ]);

        return to_route('roles.index');
    }

    public function destroy(Role $role): RedirectResponse
    {
        $this->authorize('delete', $role);

        $role->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Role deleted.')]);

        return to_route('roles.index');
    }
}
