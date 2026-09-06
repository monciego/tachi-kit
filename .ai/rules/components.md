---
paths:
    - 'resources/js/components/data-table*.tsx'
---

# Components

## Server-side v9 DataTable contract

DataTable (full shadcn demo retained) is server-driven: it takes `data`, `paginator` (Laravel Paginator JSON) and a `server` config (route + search/sort/page/per_page param names + faceted filters + toolbar actions). All state (page, pageSize, sorting, search, filters) is derived from the URL query and every change is a `router.get` visit to `server.route`; TanStack is controlled via `manualPagination/manualSorting/manualFiltering` + `rowCount`. Column components use `createColumnHelper<DataTableFeatures, T>()` (v9 generics are Features first). Pages put their columns in `pages/<feature>/columns.tsx`. Don't wire client-side filtering/pagination for list pages — add params to the controller. `vp fmt`/`vp lint`/`npm run types:check` must stay clean.

A faceted filter's `column` is a real table-column id (the toolbar looks it up with `table.getColumn()`); its URL query param defaults to `column` but can be overridden with `param` when they differ (users filter: `column: 'roles', param: 'role'`).

The `select` checkbox column is injected automatically when `enableRowSelection` is truthy — never add it to page columns (it would render checkboxes for non-selectable tables). Bulk actions are opt-in via `bulkActions: [{ label, noun?, isProtected?, confirmTitle?, confirmDescription?, onConfirm(deletableRows) }]`, shown only while rows are selected. `isProtected(row)` (paired with server-provided per-row guard flags like `deletable`) makes the dialog dynamic: it reports "X selected, N protected, M will be deleted" or disables Confirm when everything is protected, and `onConfirm` receives only the deletable rows. Backend `bulkDestroy` must also exclude the acting user's id and validate `'ids.*' => integer,distinct,exists:users,id`. Pagination is numbered (page buttons + ellipsis) driven by `pageIndex`/`pageSize`.
