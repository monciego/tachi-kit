---
paths:
    - app/Http/Controllers/UserController.php
---

# Controllers

## Superadmins are hidden and undeletable

Superadmins are invisible to everyone except superadmins (index applies `whereDoesntHave(roles, superadmin)` for non-superadmins) and are never deletable: `destroy` returns 403 for superadmin targets and `bulkDestroy` also excludes them + the acting user's own id. Rows carry a `deletable` boolean for the frontend's protected-rows dialog.

## Users list pins own + superadmin rows to the top

`UserController::index` pins row order with an `orderByRaw` CASE as the PRIMARY sort key (own account = 0, superadmins = 1, everyone else = 2), then falls back to the user-chosen sort. So your own row and superadmins stay at the top no matter the sort. The frontend renders a "You" badge on the current user's row via `usePage().props.auth.user.id`.
