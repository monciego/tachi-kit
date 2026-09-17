---
paths:
  - config/permission.php
---

# Config

## Use App\Models\Role in permission config
config/permission.php's 'role' => Role::class must resolve to App\Models\Role (the extended Spatie role that adds isSystemRole()), NOT Spatie\Permission\Models\Role. The top-of-file `use` statement shadows it — do not import the base Spatie Role. The HandleInertiaRequests shared 'roles' prop and RoleResource both call isSystemRole(), which only exists on App\Models\Role.
