import { createColumnHelper } from '@tanstack/react-table';

import type { DataTableFeatures } from '@/components/data-table-features';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useInitials } from '@/hooks/use-initials';
import type { ActivityActor, ActivityEntry } from '@/types';

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'long' });
const timeFormatter = new Intl.DateTimeFormat(undefined, {
    timeStyle: 'short',
});

/** Formats a timestamp as "September 30, 2026 · 10:42 PM". */
function formatTimestamp(value: string): string {
    const date = new Date(value);

    return `${dateFormatter.format(date)} · ${timeFormatter.format(date)}`;
}

function ActorCell({ actor }: { actor: ActivityActor | null }) {
    const getInitials = useInitials();

    if (!actor) {
        return <span className="text-muted-foreground">Unknown</span>;
    }

    return (
        <div className="flex max-w-55 items-center gap-2">
            <Avatar className="size-8">
                <AvatarImage
                    className="object-cover"
                    src={actor.avatar ?? undefined}
                    alt={actor.name}
                />
                <AvatarFallback className="text-xs">
                    {getInitials(actor.name)}
                </AvatarFallback>
            </Avatar>
            <span className="truncate font-medium">{actor.name}</span>
        </div>
    );
}

const columnHelper = createColumnHelper<DataTableFeatures, ActivityEntry>();

export function activityColumns(eventLabels: Record<string, string>) {
    return columnHelper.columns([
        columnHelper.accessor('causer', {
            header: 'Actor',
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }) => <ActorCell actor={row.original.causer} />,
        }),
        columnHelper.accessor('description', {
            header: 'Activity',
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }) => (
                <span className="whitespace-normal">
                    {row.original.description}
                </span>
            ),
        }),
        columnHelper.accessor('event', {
            header: 'Event',
            enableSorting: false,
            cell: ({ row }) => (
                <Badge variant="outline" className="font-normal">
                    {eventLabels[row.original.event] ?? row.original.event}
                </Badge>
            ),
        }),
        columnHelper.accessor('created_at', {
            header: 'Date',
            enableSorting: false,
            cell: ({ row }) => (
                <span className="text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(row.original.created_at)}
                </span>
            ),
        }),
    ]);
}
