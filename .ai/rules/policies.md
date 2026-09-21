---
paths:
  - app/Policies/UserPolicy.php
---

# Policies

## Superadmin self-demotion guard + Gate::before defer
UserPolicy::update denies when a superadmin removes 'superadmin' from their own roles (self-demotion), reading roles from the Request (nullable third param). It also denies non-superadmins editing superadmin accounts and requires users.edit permission. Because the superadmin Gate::before bypass would swallow this, AppServiceProvider's before-closure returns null (falls through to the policy) when the ability is 'update' and the subject IS the acting user, so the policy still runs for self-update.

## updateStatus policy + Gate::before defer
Gate::before in AppServiceProvider defers to UserPolicy for superadmins when ability is 'update' with self as subject, and for ALL 'updateStatus' calls (so superadmins can't self-toggle status or deactivate another superadmin). UserPolicy::updateStatus(User, User, ?Request) takes the Request to read the is_active boolean; it 403s on self-target, on deactivating a superadmin, and without users.status permission.
