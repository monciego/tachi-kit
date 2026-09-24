# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

`AGENTS.md` (Laravel Boost guidelines) is the base ruleset. Before editing any file, also read `.ai/rules/index.md` and every rule file whose globs match the path. These rules record settled decisions and non-obvious traps. Record new durable rules with the Boost `record-rule` tool, not native memory. Domain skills live in `.agents/skills/`.

## Commands

```bash
composer setup              # install, .env, key, migrate, storage:link, npm install + build
composer dev                # full dev stack (php artisan dev)
npm run dev                 # Vite only (vp dev, via vite-plus)

php artisan test --compact tests/Feature/UsersTest.php     # single file
php artisan test --compact --filter="test name"            # single test
composer test               # config:clear + pint --test + phpstan + full test suite
composer ci:check           # what CI runs: npm run check + types:check + composer test

vendor/bin/pint --dirty --format agent   # PHP formatting (run after PHP edits)
composer types:check        # phpstan / larastan
npm run check               # vp check (oxlint + formatter); npm run check:fix to fix
npm run types:check         # tsc --noEmit

php artisan wayfinder:generate --with-form   # ALWAYS pass --with-form (see below)
php artisan tachi:types     # regenerate TS role/permission constants from the PHP enums
php artisan tachi:superadmin   # create a superadmin (production has no demo accounts)
```

Use npm only (`package-lock.json`); there is no pnpm lockfile.

Tests run on in-memory SQLite (`phpunit.xml`); local dev uses MySQL (`.env.example`). Feature tests use `RefreshDatabase` automatically (`tests/Pest.php`).

## Architecture

This is a Laravel 13 + Inertia v3 + React 19 starter kit ("tachi-kit"). It builds user/role management with Spatie permissions on top of the Laravel React starter kit. Auth is handled by Fortify, including 2FA and passkeys.

### Authorization is layered and must stay in sync

- **Roles**: `superadmin`, `admin`, and `user` are system roles defined by `App\Enums\RoleName` (`Role::isSystemRole()`). Use the enum and `User::isSuperadmin()` rather than role-name strings. `config/permission.php` must point at `App\Models\Role`, not the Spatie base class.
- **Permissions**: `App\Enums\Permission` is the single source of truth (`users.*`, `roles.*`; `label()` and `group()` feed the UI). `php artisan tachi:types` generates `resources/js/constants/access.generated.ts` (`ROLES`, `PERMISSIONS`, labels, groups, types). Never edit that file by hand; a test fails when it is stale. Adding a permission means updating the enum, running `tachi:types`, and granting it in `RolePermissionSeeder`.
- **Superadmin bypass**: `Gate::before` in `AppServiceProvider` grants superadmins everything. The exceptions fall through to the policies: `updateStatus` always and `update` when the target is the acting user (`UserPolicy`, so superadmins can't demote or deactivate themselves), and `delete` on a `Role` (`RolePolicy`, so system roles and roles with users can't be deleted).
- **Shared props**: `HandleInertiaRequests` shares `auth.can` (a map of every permission name to a boolean), `auth.roles`, and `canRegister`. The frontend checks these through `usePermissions()` (`resources/js/hooks/use-permissions.ts`). Sidebar and search items are filtered by `permission`/`role` fields in `resources/js/constants/navigation.ts`.
- **Superadmin visibility**: superadmin accounts are hidden from non-superadmins, can't be deleted, and are read-only to them. Use `User::query()->visibleTo($viewer)` for any user listing or count. Controllers, form requests, and policies each enforce parts of this. See `.ai/rules/controllers.md`, `policies.md`, and `requests.md` before touching user flows.
- **Permission checks** use Spatie's `checkPermissionTo()`, not `hasPermissionTo()`. A permission that hasn't been seeded then denies access instead of throwing a 500.
- **Role ordering**: use the `Role::systemRolesFirst()` scope instead of a raw `CASE` ordering.

### List pages

Index actions type-hint `App\Http\Requests\DataTableRequest`, which parses the DataTable query string (`perPage()`, `sortColumn()`, `sortDirection()`, `search()`, `filter('role')`, `isPastLastPage()`) with safe fallbacks. Don't re-parse `per_page`/`sort` by hand.

### Seeding and avatars

- `DatabaseSeeder` always runs `RolePermissionSeeder`; `DemoUserSeeder` (demo accounts, password `password`) is skipped in production.
- Avatars are stored at `users.avatar_path` on `config('tachi.avatars.disk')` (`AVATAR_DISK`). `User` appends an `avatar` URL attribute and hides the path, so the frontend uses `user.avatar` directly. Uploads go through `Settings\AvatarController`. Select `avatar_path` when narrowing user columns.

### Dashboard

`DashboardController` returns user analytics (stats, monthly sign-ups, recent users) as deferred props, and only to viewers who pass `viewAny` on `User`. The page renders skeletons while those props load. The monthly grouping branches on the database driver because tests run on SQLite and dev uses MySQL. Charts use shadcn `ui/chart.tsx` (recharts) and the `--chart-*` tokens.

### Auth and registration

- Public registration is toggled by `config('tachi.registration.public')` (`ALLOWS_PUBLIC_REGISTRATION`). It is gated inside `FortifyServiceProvider`, and `Features::registration()` stays enabled so routes and Wayfinder output don't change. Kit-level toggles belong in `config/tachi.php`.
- Inactive users (`is_active = false`) are rejected in `Fortify::authenticateUsing` and in the passkey login callback. Don't use a global scope for this.
- New registrants always get the `user` role (`CreateNewUser`).

### Frontend

- Pages are in `resources/js/pages/<feature>/` and rendered via `Inertia::render('<feature>/<page>')`. List pages keep their table columns in a sibling `columns.tsx`.
- **Server-driven DataTable** (`resources/js/components/data-table*.tsx`): TanStack Table v9 runs in manual mode. All state (page, sort, search, filters) lives in the URL query, and every change triggers a `router.get` to the controller. Filtering and pagination go in the controller, not the client. The contract is in `.ai/rules/components.md`.
- **Wayfinder**: route and action helpers are generated into `resources/js/routes/` and `resources/js/actions/` (gitignored). Vite uses `formVariants: true`, so regenerating without `--with-form` breaks `tsc`.
- A single `JsonResource` passed as an Inertia prop gets wrapped in `{data: ...}`. Pass `Resource::make($m)->resolve()` instead. Paginated collections are fine as-is.
- Flash toasts use `Inertia::flash('toast', ...)` on the server and `use-flash-toast` on the client.
- `resources/js/components/ui/*` is shadcn and is excluded from lint and format.
- Frontend formatting: 4-space indent, single quotes, 80 columns, and sorted Tailwind classes (configured in `vite.config.ts`; `.prettierrc.json` mirrors it for editors). Boost-generated files (`AGENTS.md`, `.agents/`, `.ai/`) are excluded from formatting.
