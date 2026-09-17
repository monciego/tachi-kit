---
paths:
  - app/Http/Middleware/HandleInertiaRequests.php
---

# Middleware

## Share a `can` permission map on every autenticated request
Frontend `usePermissions().can()` reads `auth.can`, NOT `auth.user.can`. Build the map in HandleInertiaRequests::share() from `$user->can($name)` for every `Permission::all()` name, wrapped in try/catch for `PermissionDoesNotExist` so a missing/unseeded permission degrades to false instead of a 500. Roles are shared via `auth.roles` (array of {id,name,is_system_role}) — `auth.user` stays the raw model. Superadmin gets `true` for all via the Gate::before bypass in AppServiceProvider.
