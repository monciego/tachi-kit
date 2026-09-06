import * as React from 'react';
import { type ReactTable, type RowData } from '@tanstack/react-table';
import { X } from 'lucide-react';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { DataTableViewOptions } from './data-table-view-options';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { type DataTableFeatures } from './data-table-features';
import { type DataTableFilterConfig } from '../types/table';

interface DataTableToolbarProps<TData extends RowData> {
    table: ReactTable<DataTableFeatures, TData>;
    searchValue: string;
    searchPlaceholder?: string;
    onSearchChange: (value: string) => void;
    onReset: () => void;
    filters?: DataTableFilterConfig[];
    actions?: React.ReactNode;
}

export function DataTableToolbar<TData extends RowData>({
    table,
    searchValue,
    searchPlaceholder = 'Filter...',
    onSearchChange,
    onReset,
    filters = [],
    actions,
}: DataTableToolbarProps<TData>) {
    const isFiltered =
        table.state.columnFilters.length > 0 || searchValue !== '';

    return (
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
                <Input
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className="h-8 w-full min-w-0 lg:w-[250px]"
                />
                {filters.map((filter) => {
                    const column = table.getColumn(filter.column);

                    if (!column) {
                        return null;
                    }

                    return (
                        <DataTableFacetedFilter
                            key={filter.column}
                            column={column}
                            title={filter.title}
                            options={filter.options}
                        />
                    );
                })}
                {isFiltered && (
                    <Button variant="ghost" size="sm" onClick={onReset}>
                        Reset
                        <X />
                    </Button>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <DataTableViewOptions table={table} />
                {actions}
            </div>
        </div>
    );
}
