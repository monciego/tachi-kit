# Tachi Kit

**Cut through boilerplate.**

Tachi Kit is an opinionated Laravel + React + Inertia starter kit with authentication, role-based permissions, user management and more. Skip the boring stuff and focus on what makes your app unique.

It is built on top of the official [Laravel React starter kit](https://github.com/laravel/react-starter-kit) and keeps its conventions, so everything in the Laravel docs still applies.

## What's included

- **Authentication**: login, registration, email verification, password reset, two-factor authentication and passkeys (Laravel Fortify). Inactive accounts can't sign in.
- **Roles & permissions**: [spatie/laravel-permission](https://spatie.be/docs/laravel-permission) with built-in `superadmin`, `admin` and `user` roles, custom roles, and policies that protect superadmins from being edited, deactivated or deleted.
- **User management**: server-driven data tables with search, faceted filters, sorting, pagination, bulk delete and account status.
- **Dashboard**: stat cards, a monthly sign-ups chart and a recent users table, loaded as deferred props.
- **Profile settings**: name, email, avatar upload, password, 2FA, passkeys and appearance (light/dark/system).
- **Typed end to end**: [Wayfinder](https://github.com/laravel/wayfinder) route helpers, TypeScript role and permission constants generated from PHP enums, and PHPStan at level 7.
- **Quality gates**: Pest, Pint, PHPStan, oxlint, formatting and `tsc`, all run in GitHub Actions.

**Stack:** Laravel 13, React 19, Inertia 3, Tailwind CSS 4, shadcn/ui, Pest.

## Requirements

- PHP 8.4+ and Composer
- Node.js 22+ and npm
- MySQL or SQLite

## Getting started

```bash
git clone <your-repo-url> my-app
cd my-app
composer setup      # install dependencies, create .env, generate a key, migrate, link storage, build assets
```

Point `.env` at your database, then seed and start the app:

```bash
php artisan migrate --seed
composer dev        # start the app and Vite
```

### Demo accounts

Outside production, seeding creates these accounts plus 50 members spread over the past year. The password for all of them is `password`.

| Email                        | Role       |
| ---------------------------- | ---------- |
| `superadmin@tachikit.com`    | superadmin |
| `superadmin2@tachikit.com`   | superadmin |
| `administrator@tachikit.com` | admin      |
| `admin@tachikit.com`         | admin      |

### Production

In production, `php artisan db:seed --force` only seeds roles and permissions; no demo accounts are created. Create your first account with:

```bash
php artisan tachi:superadmin
```

It asks for a name, email and password (or accepts `--name`, `--email` and `--password`).

## Configuration

| Variable                     | Default  | Description                                                                                                                             |
| ---------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `ALLOWS_PUBLIC_REGISTRATION` | `false`  | Allow anyone to sign up. When off, `/register` returns 404 and sign-up links are hidden; admins create accounts from the Users page.    |
| `AVATAR_DISK`                | `public` | Filesystem disk for avatars. Use `s3` (or another public cloud disk) in production. The `public` disk needs `php artisan storage:link`. |

Kit-level settings live in `config/tachi.php`.

## Roles & permissions

| Role         | Access                                                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| `superadmin` | Everything. Hidden from non-superadmins, can't be deleted or deactivated, and can't be combined with other roles. |
| `admin`      | Manage users (view, create, edit, delete, change status).                                                         |
| `user`       | Default role for new sign-ups. No management access.                                                              |

System roles can't be renamed or deleted. Custom roles can be created from the Roles page.

### Adding a permission

1. Add a case (and its label) to `app/Enums/Permission.php`, e.g. `case PostsPublish = 'posts.publish';`.
2. Regenerate the frontend types: `php artisan tachi:types`.
3. Seed it: `php artisan db:seed --class=RolePermissionSeeder` (grant it to `admin` there if needed).
4. Check it in a policy with `$user->checkPermissionTo(Permission::PostsPublish->value)`, and in React with `can(PERMISSIONS.POSTS_PUBLISH)` from `usePermissions()`.

A test fails if the generated file is out of date, so CI catches a forgotten step 2.

## Commands

| Command                                      | Description                                                          |
| -------------------------------------------- | -------------------------------------------------------------------- |
| `composer dev`                               | Start the app and Vite together (`php artisan dev`).                 |
| `composer test`                              | Pint, PHPStan and the Pest suite.                                    |
| `composer ci:check`                          | Everything CI runs (adds `npm run check` and `npm run types:check`). |
| `php artisan test --filter="name"`           | Run a single test.                                                   |
| `npm run check:fix`                          | Fix lint and formatting issues in the frontend.                      |
| `php artisan wayfinder:generate --with-form` | Regenerate route helpers (always pass `--with-form`).                |
| `php artisan tachi:types`                    | Regenerate role and permission constants for TypeScript.             |
| `php artisan tachi:superadmin`               | Create a superadmin account.                                         |

## License

Tachi Kit is open-source software licensed under the MIT license.
