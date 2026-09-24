import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const numberFormatter = new Intl.NumberFormat();

type StatCardProps = {
    title: string;
    value: number;
    icon: LucideIcon;
    description?: ReactNode;
};

export function StatCard({
    title,
    value,
    icon: Icon,
    description,
}: StatCardProps) {
    return (
        <Card className="gap-2">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardDescription className="font-medium">
                    {title}
                </CardDescription>
                <Icon className="text-muted-foreground size-4" aria-hidden />
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
                <CardTitle className="text-3xl font-semibold tabular-nums">
                    {numberFormatter.format(value)}
                </CardTitle>
                {description && (
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        {description}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function StatCardSkeleton() {
    return (
        <Card className="gap-2">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="size-4 rounded-full" />
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-32" />
            </CardContent>
        </Card>
    );
}
