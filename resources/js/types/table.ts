import type * as React from 'react';

export interface Paginator<TData> {
    data: TData[];
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

export interface DataTableFilterOption {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
}

export interface DataTableFilterConfig {
    column: string;
    /** Query parameter name; defaults to `column`. */
    param?: string;
    title: string;
    options: DataTableFilterOption[];
}
