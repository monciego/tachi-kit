---
paths:
  - app/Policies/UserPolicy.php
---

# Policies

## Superadmin self-demotion guard + Gate::before defer
UserPolicy::update denies when a superadmin removes 'superadmin' from their own roles (self-demotion), reading roles from the Request (nullable third param). It also denies non-superadmins editing superadmin accounts and requires users.edit permission. Because the superadmin Gate::before bypass would swallow this, AppServiceProvider's before-closure returns null (falls through to the policy) when the ability is 'update' and the subject IS the acting user, so the policy still runs for self-update.
