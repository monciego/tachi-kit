---
paths:
  - 'database/seeders/**'
---

# Seeders

## RolePermissionSeeder cache + idempotency
RolePermissionSeeder must be idempotent and cache-safe: create permissions with `Permission::query()->firstOrCreate(['name' => ...])` (not `Permission::create`, which throws PermissionAlreadyExists on re-run), and call `app(PermissionRegistrar::class)->forgetCachedPermissions()` AFTER creating permissions but BEFORE givePermissionTo. This is required because DatabaseSeeder runs with WithoutModelEvents, which disables Spatie's on-save cache refresh — otherwise a stale empty permission cache makes givePermissionTo throw PermissionDoesNotExist during db:seed. Admin role gets users.view/create/edit/delete.

## RolePermissionSeeder admin permissions include users.status
Admin role gets users.view/create/edit/delete AND users.status (status toggle). Superadmin automatically gets every permission via givePermissionTo(PermissionEnum::values()).
