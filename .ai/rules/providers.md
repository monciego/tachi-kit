---
paths:
    - app/Providers/FortifyServiceProvider.php
---

# Providers

## Public registration gate lives in FortifyServiceProvider

Public registration is toggled by config('tachi.registration.public') (env ALLOWS_PUBLIC_REGISTRATION). The GET /register gate is the registerView closure (abort 404 when disabled); the POST gate aborts 404 inside the Fortify::createUsersUsing factory before user creation. Kept Features::registration() always enabled so Fortify routes and Wayfinder output stay stable. The frontend reads the same flag via the shared Inertia prop `canRegister` (see app/Http/Middleware/HandleInertiaRequests.php) — hide signup links when false. Kit-level business toggles (like public vs admin registration) live under config/tachi.php, not fortify.php.
