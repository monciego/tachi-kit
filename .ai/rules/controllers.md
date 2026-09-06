---
paths:
    - app/Http/Controllers/UserController.php
---

# Controllers

## Superadmins are hidden and undeletable

Superadmins are invisible to everyone except superadmins (index applies `whereDoesntHave(roles, superadmin)` for non-superadmins) and are never deletable: `destroy` returns 403 for superadmin targets and `bulkDestroy` also excludes them + the acting user's own id. Rows carry a `deletable` boolean for the frontend's protected-rows dialog.

## Users list pins own + superadmin rows to the top

`UserController::index` pins row order with an `orderByRaw` CASE as the PRIMARY sort key (own account = 0, superadmins = 1, everyone else = 2), then falls back to the user-chosen sort. So your own row and superadmins stay at the top no matter the sort. The frontend renders a "You" badge on the current user's row via `usePage().props.auth.user.id`.

## User is_active status + updateStatus guards
Users have an `is_active` flag. `updateStatus` (PATCH /users/{user}/status) accepts a required boolean `is_active`; it 403s when the target is the acting user (self-status change) and when deactivating a superadmin. `index` exposes `is_active` per row and accepts a comma `status` filter (active/inactive) applied only when exactly one of the two is selected (XOR).
