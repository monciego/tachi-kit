import { Head } from '@inertiajs/react';
import { useMemo } from 'react';

import { DataTable } from '@/components/data-table';
import activity from '@/routes/activity';
import type {
    ActivityEntry,
    ActivityEventOption,
    BreadcrumbItem,
} from '@/types';
import type { Paginator } from '@/types/table';

import { activityColumns } from './columns';

interface IndexProps {
    activities: Paginator<ActivityEntry>;
    eventOptions: ActivityEventOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Activity log',
        href: activity.index(),
    },
];

export default function Index({ activities, eventOptions }: IndexProps) {
    const columns = useMemo(
        () =>
            activityColumns(
                Object.fromEntries(
                    eventOptions.map(({ value, label }) => [value, label]),
                ),
            ),
        [eventOptions],
    );

    return (
        <>
            <Head title="Activity log" />
            <div className="mb-4 flex flex-col gap-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                    Activity log
                </h2>
                <p className="text-muted-foreground">
                    Who did what, and when, across users, roles and sign-ins
                </p>
            </div>

            <DataTable
                columns={columns}
                data={activities.data}
                paginator={activities}
                server={{
                    route: activity.index().url,
                    searchPlaceholder: 'Search by name or email...',
                    filters: [
                        {
                            column: 'event',
                            title: 'Event',
                            options: eventOptions,
                        },
                    ],
                }}
            />
        </>
    );
}

Index.layout = {
    breadcrumbs,
};
