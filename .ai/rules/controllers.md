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

## Role filter excludes superadmin for non-superadmins
`roleOptions` (the Role faceted filter) excludes 'superadmin' for everyone except superadmins, mirroring the row-hiding rule — non-superadmins only ever see admin + user in the filter.

## create/store user flow + role assignment rules
Creating users is gated to superadmin/admin (StoreUserRequest::authorize + UserController::create abort 403). store() creates the user (plaintext password — the model's `hashed` cast encrypts it) then `assignRole($validated roles)`; use `Inertia::flash('toast', ...)` + redirect to users.index. `availableRoleNames()` feeds both `roleOptions` (index filter) and `roles` (create page) and excludes superadmin for non-superadmins; the request's `roles.*` closure rejects superadmin assignment by non-superadmins as a validation error.
