---
paths:
  - 'app/Actions/Fortify/**'
---

# Fortify

## New registrants are assigned the default user role
Public registration always assigns the built-in `user` role. CreateNewUser resolves it with `Role::query()->firstOrCreate(['name' => 'user'])` and calls `$user->assignRole(...)`. Don't give new registrants any other role; superadmin/admin are seeded-only and never assigned via registration.
