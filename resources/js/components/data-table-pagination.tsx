import { type ReactTable, type RowData } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from './ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';

import { type DataTableFeatures } from './data-table-features';

interface DataTablePaginationProps<TData extends RowData> {
    table: ReactTable<DataTableFeatures, TData>;
    pageSizeOptions?: number[];
    rowSelection?: boolean;
}

type PageItem = number | 'ellipsis';

function getPageItems(current: number, total: number): PageItem[] {
    if (total < 1) {
        return [];
    }

    const items = new Set<number>([1, total, current]);

    if (current > 1) {
        items.add(current - 1);
    }

    if (current < total) {
        items.add(current + 1);
    }

    const sorted = Array.from(items)
        .filter((page) => page >= 1 && page <= total)
        .sort((a, b) => a - b);

    const out: PageItem[] = [];

    sorted.forEach((page, index) => {
        if (index > 0 && page - sorted[index - 1] > 1) {
            out.push('ellipsis');
        }
        out.push(page);
    });

    return out;
}

export function DataTablePagination<TData extends RowData>({
    table,
    pageSizeOptions = [10, 20, 50, 100],
    rowSelection = false,
}: DataTablePaginationProps<TData>) {
    const { pageIndex, pageSize } = table.state.pagination;
    const rowCount = table.getRowCount();
    const from = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
    const to = Math.min(from + pageSize - 1, rowCount);
    const selectedCount = table.getSelectedRowModel().rows.length;
    const pageCount = table.getPageCount();
    const currentPage = pageIndex + 1;
    const pageItems = getPageItems(currentPage, pageCount);

    return (
        <div className="flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-muted-foreground flex-1 text-sm">
                {rowSelection ? (
                    <>
                        {selectedCount} of {rowCount} row(s) selected.
                    </>
                ) : (
                    <>
                        {rowCount === 0 ? (
                            'No rows.'
                        ) : (
                            <>
                                Showing {from}–{to} of {rowCount}
                            </>
                        )}
                    </>
                )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium max-sm:hidden">
                        Rows per page
                    </p>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value));
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {pageSizeOptions.map((pageSize) => (
                                <SelectItem
                                    key={pageSize}
                                    value={`${pageSize}`}
                                >
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft />
                    </Button>
                    {pageItems.map((item, index) =>
                        item === 'ellipsis' ? (
                            <span
                                key={`ellipsis-${index}`}
                                className="text-muted-foreground px-1 text-sm"
                            >
                                …
                            </span>
                        ) : (
                            <Button
                                key={item}
                                variant={
                                    item === currentPage ? 'default' : 'outline'
                                }
                                size="icon"
                                className="size-8"
                                onClick={() => table.setPageIndex(item - 1)}
                                aria-current={
                                    item === currentPage ? 'page' : undefined
                                }
                            >
                                {item}
                            </Button>
                        ),
                    )}
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight />
                    </Button>
                </div>
            </div>
        </div>
    );
}
