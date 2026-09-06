---
paths:
    - '**'
---

# General

## Regenerate Wayfinder routes with --with-form

`php artisan wayfinder:generate` regenerates ALL route files and, without `--with-form`, drops the `.form()` variants that `vite.config.ts`'s `wayfinder({ formVariants: true })` otherwise emits — breaking `tsc` for auth/settings pages. Always regenerate with `php artisan wayfinder:generate --with-form`. Touched route functions take `.url` via the call form (e.g. `users.bulkDelete().url`). routes/actions dirs are gitignored.
