import * as React from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    useTable,
    type ColumnDef,
    type ColumnFiltersState,
    type ColumnVisibilityState,
    type RowData,
    type RowSelectionState,
    type Updater,
} from '@tanstack/react-table';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';

import { features, type DataTableFeatures } from './data-table-features';
import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';
import { type DataTableFilterConfig, type Paginator } from '../types/table';

interface DataTableServerConfig {
    /** Base path the table navigates against, e.g. `users.index().url`. */
    route: string;
    searchParam?: string;
    searchPlaceholder?: string;
    pageParam?: string;
    perPageParam?: string;
    sortParam?: string;
    directionParam?: string;
    pageSizeOptions?: number[];
    defaultPageSize?: number;
    /** Faceted column filters, e.g. role for the users table. */
    filters?: DataTableFilterConfig[];
    /** Rendered on the right-hand side of the toolbar, e.g. an "Add" button. */
    actions?: React.ReactNode;
}

interface DataTableBulkAction<TData extends RowData> {
    label: string;
    /** Noun used in generated messages, e.g. "users". */
    noun?: string;
    /** Returns true for rows that are protected and must be skipped. */
    isProtected?: (row: TData) => boolean;
    confirmTitle?: string;
    confirmDescription?: string;
    /** Receives the deletable (non-protected) selected rows; e.g. post their ids to a bulk endpoint. */
    onConfirm: (deletableRows: TData[]) => void;
}

interface DataTableProps<TData extends RowData> {
    columns: ColumnDef<DataTableFeatures, TData>[];
    data: TData[];
    paginator: Paginator<TData>;
    server: DataTableServerConfig;
    /** Enables per-row checkboxes; the `select` column is injected automatically. */
    enableRowSelection?: boolean;
    /** Bulk actions shown when rows are selected (only when `enableRowSelection`). */
    bulkActions?: DataTableBulkAction<TData>[];
}

interface ServerState {
    pageIndex: number;
    pageSize: number;
    search: string;
    sort: { id: string; desc: boolean } | null;
    filters: Record<string, string[]>;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function resolveUpdater<T>(updater: Updater<T>, current: T): T {
    return typeof updater === 'function'
        ? (updater as (previous: T) => T)(current)
        : updater;
}

function selectColumn<TData extends RowData>(): ColumnDef<
    DataTableFeatures,
    TData
> {
    return {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    };
}

export function DataTable<TData extends RowData>({
    columns,
    data,
    paginator,
    server,
    enableRowSelection = false,
    bulkActions = [],
}: DataTableProps<TData>) {
    const { url } = usePage();

    const config = React.useMemo(
        () => ({
            searchParam: 'search',
            searchPlaceholder: 'Filter...',
            pageParam: 'page',
            perPageParam: 'per_page',
            sortParam: 'sort',
            directionParam: 'direction',
            defaultPageSize: 10,
            pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
            ...server,
        }),
        [server],
    );

    const state = React.useMemo(() => {
        const params = new URLSearchParams(url.split('?')[1] ?? '');

        const pageSizeRaw = Number(params.get(config.perPageParam));
        const pageSize = config.pageSizeOptions.includes(pageSizeRaw)
            ? pageSizeRaw
            : config.defaultPageSize;

        const pageRaw = Number(params.get(config.pageParam));
        const pageIndex =
            Number.isInteger(pageRaw) && pageRaw >= 1 ? pageRaw - 1 : 0;

        const sortId = params.get(config.sortParam);
        const sort = sortId
            ? { id: sortId, desc: params.get(config.directionParam) === 'desc' }
            : null;

        const filters: ServerState['filters'] = {};
        for (const filter of config.filters ?? []) {
            const values = params.get(filter.param ?? filter.column);
            if (values) {
                filters[filter.column] = values.split(',').filter(Boolean);
            }
        }

        return {
            pageIndex,
            pageSize,
            search: params.get(config.searchParam) ?? '',
            sort,
            filters,
        } satisfies ServerState;
    }, [url, config]);

    const navigate = React.useCallback(
        (
            changes: Partial<
                Pick<
                    ServerState,
                    'pageIndex' | 'pageSize' | 'search' | 'sort' | 'filters'
                >
            >,
        ) => {
            const stateChanged =
                changes.search !== undefined ||
                changes.sort !== undefined ||
                changes.filters !== undefined;

            const next: ServerState = {
                pageIndex:
                    changes.pageIndex ?? (stateChanged ? 0 : state.pageIndex),
                pageSize: changes.pageSize ?? state.pageSize,
                search: changes.search ?? state.search,
                sort: changes.sort !== undefined ? changes.sort : state.sort,
                filters: changes.filters ?? state.filters,
            };

            const params = new URLSearchParams();
            if (next.pageIndex > 0) {
                params.set(config.pageParam, String(next.pageIndex + 1));
            }
            if (next.pageSize !== config.defaultPageSize) {
                params.set(config.perPageParam, String(next.pageSize));
            }
            if (next.sort) {
                params.set(config.sortParam, next.sort.id);
                params.set(
                    config.directionParam,
                    next.sort.desc ? 'desc' : 'asc',
                );
            }
            if (next.search.trim() !== '') {
                params.set(config.searchParam, next.search.trim());
            }
            for (const filter of config.filters ?? []) {
                const values = next.filters[filter.column] ?? [];
                if (values.length > 0) {
                    params.set(filter.param ?? filter.column, values.join(','));
                }
            }

            const query = params.toString();
            router.get(
                query ? `${config.route}?${query}` : config.route,
                {},
                { preserveScroll: true },
            );
        },
        [config, state],
    );

    const [columnVisibility, setColumnVisibility] =
        React.useState<ColumnVisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
        {},
    );

    // Selection is page-scoped: it only lives in the client, so wipe it when
    // the server returns new rows after a navigation.
    React.useEffect(() => {
        setRowSelection({});
    }, [url]);

    const [searchInput, setSearchInput] = React.useState(state.search);
    const searchTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );

    React.useEffect(() => {
        setSearchInput(state.search);
    }, [state.search]);

    React.useEffect(
        () => () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        },
        [],
    );

    const handleSearchChange = React.useCallback(
        (value: string) => {
            setSearchInput(value);
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
            searchTimeout.current = setTimeout(() => {
                navigate({ search: value });
            }, 350);
        },
        [navigate],
    );

    const effectiveColumns = React.useMemo(
        () =>
            enableRowSelection ? [selectColumn<TData>(), ...columns] : columns,
        [columns, enableRowSelection],
    );

    const table = useTable({
        features,
        data,
        columns: effectiveColumns,
        state: {
            pagination: {
                pageIndex: state.pageIndex,
                pageSize: state.pageSize,
            },
            sorting: state.sort
                ? [{ id: state.sort.id, desc: state.sort.desc }]
                : [],
            columnFilters: Object.entries(state.filters).map(([id, value]) => ({
                id,
                value,
            })),
            columnVisibility,
            rowSelection,
        },
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        rowCount: paginator.total,
        enableRowSelection,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: (updater) => {
            const next = resolveUpdater(updater, {
                pageIndex: state.pageIndex,
                pageSize: state.pageSize,
            });
            navigate({ pageIndex: next.pageIndex, pageSize: next.pageSize });
        },
        onSortingChange: (updater) => {
            const next = resolveUpdater(
                updater,
                state.sort
                    ? [{ id: state.sort.id, desc: state.sort.desc }]
                    : [],
            );
            navigate({
                sort: next[0] ? { id: next[0].id, desc: next[0].desc } : null,
            });
        },
        onColumnFiltersChange: (updater) => {
            const previous: ColumnFiltersState = Object.entries(
                state.filters,
            ).map(([id, value]) => ({ id, value }));
            const next = resolveUpdater(updater, previous);
            const filters: ServerState['filters'] = {};
            for (const filter of next) {
                if (Array.isArray(filter.value) && filter.value.length > 0) {
                    filters[filter.id] = filter.value as string[];
                }
            }
            navigate({ filters });
        },
        onColumnVisibilityChange: setColumnVisibility,
    });

    const handleReset = React.useCallback(() => {
        navigate({ search: '', filters: {} });
    }, [navigate]);

    const selectedRows = React.useMemo(
        () => table.getSelectedRowModel().rows.map((row) => row.original),
        [table, rowSelection],
    );

    const [pendingBulkAction, setPendingBulkAction] = React.useState<
        DataTableBulkAction<TData> | undefined
    >(undefined);

    const showBulkBar =
        enableRowSelection && bulkActions.length > 0 && selectedRows.length > 0;

    const bulkDialog = React.useMemo(() => {
        if (!pendingBulkAction) {
            return null;
        }

        const action = pendingBulkAction;
        const isProtected = action.isProtected ?? (() => false);
        const deletableRows = selectedRows.filter((row) => !isProtected(row));
        const protectedRows = selectedRows.filter(isProtected);
        const noun = action.noun ?? 'items';
        const verb = action.label.toLowerCase();
        const verbed = verb.endsWith('e') ? `${verb}d` : `${verb}ed`;
        const totalCount = selectedRows.length;
        const deletableCount = deletableRows.length;
        const protectedCount = protectedRows.length;

        if (deletableCount === 0) {
            return {
                action,
                title: `Cannot ${verb} selected ${noun}`,
                description: `None of the ${totalCount} selected ${noun} can be ${verbed} because they are protected accounts.`,
                confirmLabel: undefined,
                disabled: true,
            };
        }

        if (protectedCount > 0) {
            return {
                action,
                title: `Some ${noun} cannot be ${verbed}`,
                description: `You selected ${totalCount} ${noun}, but ${protectedCount} of them cannot be ${verbed} because they are protected accounts. ${deletableCount} ${noun} will be ${verbed}. The protected ${noun} will be skipped.`,
                confirmLabel: `${action.label} ${deletableCount}`,
                disabled: false,
            };
        }

        return {
            action,
            title: action.confirmTitle ?? `Confirm ${verb}`,
            description:
                action.confirmDescription ??
                `${action.label} the ${totalCount} selected ${noun}?`,
            confirmLabel: action.label,
            disabled: false,
        };
    }, [pendingBulkAction, selectedRows]);

    const handleConfirmBulk = () => {
        if (!pendingBulkAction) {
            return;
        }
        const action = pendingBulkAction;
        const isProtected = action.isProtected ?? (() => false);
        const deletableRows = selectedRows.filter((row) => !isProtected(row));
        setPendingBulkAction(undefined);
        action.onConfirm(deletableRows);
    };

    return (
        <div className="flex flex-col gap-4">
            <DataTableToolbar
                table={table}
                searchValue={searchInput}
                searchPlaceholder={config.searchPlaceholder}
                onSearchChange={handleSearchChange}
                onReset={handleReset}
                filters={config.filters}
                actions={config.actions}
            />
            {showBulkBar && (
                <div className="-my-1 flex flex-wrap items-center gap-2">
                    <p className="text-muted-foreground text-sm font-medium">
                        {selectedRows.length} selected
                    </p>
                    {bulkActions.map((action) => (
                        <Button
                            key={action.label}
                            variant="outline"
                            size="sm"
                            onClick={() => setPendingBulkAction(action)}
                        >
                            {action.label}
                        </Button>
                    ))}
                </div>
            )}
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <table.FlexRender
                                                    header={header}
                                                />
                                            )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            <table.FlexRender cell={cell} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={effectiveColumns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination
                table={table}
                rowSelection={enableRowSelection}
                pageSizeOptions={config.pageSizeOptions}
            />

            <Dialog
                open={pendingBulkAction !== undefined}
                onOpenChange={(open) =>
                    !open && setPendingBulkAction(undefined)
                }
            >
                <DialogContent>
                    {bulkDialog && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{bulkDialog.title}</DialogTitle>
                                {bulkDialog.description ? (
                                    <DialogDescription>
                                        {bulkDialog.description}
                                    </DialogDescription>
                                ) : null}
                            </DialogHeader>
                            <DialogFooter>
                                {bulkDialog.disabled ? (
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setPendingBulkAction(undefined)
                                        }
                                    >
                                        Close
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setPendingBulkAction(undefined)
                                            }
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleConfirmBulk}
                                        >
                                            {bulkDialog.confirmLabel}
                                        </Button>
                                    </>
                                )}
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
