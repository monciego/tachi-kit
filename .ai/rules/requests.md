---
paths:
  - app/Http/Requests/UpdateUserRequest.php
---

# Requests

## UpdateUserRequest: password optional, self-ignored unique email
authorize() requires superadmin/admin. password is nullable + confirmed (blank keeps current). email unique ignores the current route('user'). roles required array with exists:roles,name; role *.* has ladenschluss closure forbidding non-superadmins from including 'superadmin'. Note: because validation runs before the controller, an admin submitting a superadmin role gets a 302 validation redirect, not a 403 — the controller 403 guard only fires on payloads that pass validation.
