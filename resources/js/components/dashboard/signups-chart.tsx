import { BarChart3, Table2 } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { MonthlySignups } from '@/types';

const chartConfig = {
    total: {
        label: 'New users',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

const shortMonth = new Intl.DateTimeFormat(undefined, { month: 'short' });
const longMonth = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
});
const numberFormatter = new Intl.NumberFormat();

/** Parse a `YYYY-MM` key as a local date so the month never shifts by timezone. */
function toDate(month: string): Date {
    const [year, monthIndex] = month.split('-').map(Number);

    return new Date(year, monthIndex - 1, 1);
}

type View = 'chart' | 'table';

export function SignupsChart({ signups }: { signups: MonthlySignups[] }) {
    const [view, setView] = useState<View>('chart');
    const total = signups.reduce((sum, month) => sum + month.total, 0);

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                    <CardTitle>New users</CardTitle>
                    <CardDescription>
                        {numberFormatter.format(total)} sign-ups in the last{' '}
                        {signups.length} months
                    </CardDescription>
                </div>
                <ToggleGroup
                    type="single"
                    size="sm"
                    variant="outline"
                    value={view}
                    onValueChange={(value) => value && setView(value as View)}
                    aria-label="Display as"
                >
                    <ToggleGroupItem value="chart" aria-label="Chart view">
                        <BarChart3 />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="table" aria-label="Table view">
                        <Table2 />
                    </ToggleGroupItem>
                </ToggleGroup>
            </CardHeader>
            <CardContent>
                {view === 'chart' ? (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-64 w-full"
                        role="img"
                        aria-label={`Bar chart of new users per month, ${numberFormatter.format(total)} in total`}
                    >
                        <BarChart data={signups} margin={{ top: 8 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(month: string) =>
                                    shortMonth.format(toDate(month))
                                }
                            />
                            <YAxis
                                allowDecimals={false}
                                tickLine={false}
                                axisLine={false}
                                width={32}
                            />
                            <ChartTooltip
                                cursor={{ fill: 'var(--muted)' }}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(_, payload) => {
                                            const month = payload[0]?.payload
                                                ?.month as string | undefined;

                                            return month
                                                ? longMonth.format(
                                                      toDate(month),
                                                  )
                                                : null;
                                        }}
                                    />
                                }
                            />
                            <Bar
                                dataKey="total"
                                fill="var(--color-total)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="h-64 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Month</TableHead>
                                    <TableHead className="text-right">
                                        New users
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {signups.map(({ month, total }) => (
                                    <TableRow key={month}>
                                        <TableCell>
                                            {longMonth.format(toDate(month))}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {numberFormatter.format(total)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function SignupsChartSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-col gap-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-64 w-full" />
            </CardContent>
        </Card>
    );
}
