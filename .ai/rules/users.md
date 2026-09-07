---
paths:
  - 'resources/js/pages/users/*.tsx'
---

# Users

## Shared RolePicker for create/edit user pages
create.tsx and edit.tsx share resources/js/pages/users/roles-picker.tsx (checkbox grid of roles with colored badges). It receives roles, selected, onChange, and disabled. Both pages bind it to local selectedRoles state (edit seeds from user.roles); the edit page disables it entirely when the target is a superadmin. Do not reintroduce per-page inline role grids.

## Superadmin is mutually exclusive
The picker enforces that superadmin is never combined with other roles: selecting superadmin clears all other selections and disables the other checkboxes (with an info alert: "Superadmin has unrestricted access and cannot be combined with other roles"). Selecting any other role while superadmin is active is a no-op. The backend also enforces this implicitly (only superadmins may assign superadmin), so non-superadmin creators never see the superadmin option in the roles list.