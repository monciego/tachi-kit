import { Head, usePage } from '@inertiajs/react';
import {
    TrendingDown,
    TrendingUp,
    UserCheck,
    UserPlus,
    Users,
    UserX,
} from 'lucide-react';

import {
    RecentUsersTable,
    RecentUsersTableSkeleton,
} from '@/components/dashboard/recent-users-table';
import {
    SignupsChart,
    SignupsChartSkeleton,
} from '@/components/dashboard/signups-chart';
import { StatCard, StatCardSkeleton } from '@/components/stat-card';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { PERMISSIONS } from '@/constants/permissions';
import { usePermissions } from '@/hooks/use-permissions';
import { dashboard } from '@/routes';
import type { DashboardStats, MonthlySignups, RecentUser } from '@/types';

type DashboardProps = {
    stats?: DashboardStats;
    signups?: MonthlySignups[];
    recentUsers?: RecentUser[];
};

const percentFormatter = new Intl.NumberFormat(undefined, {
    style: 'percent',
    maximumFractionDigits: 0,
});

export default function Dashboard({
    stats,
    signups,
    recentUsers,
}: DashboardProps) {
    const { auth } = usePage().props;
    const { can } = usePermissions();

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Welcome back, {auth.user.name}
                    </h2>
                    <p className="text-muted-foreground">
                        Here's what's happening in your workspace.
                    </p>
                </div>

                {can(PERMISSIONS.USERS_VIEW) ? (
                    <>
                        <StatCards stats={stats} />
                        <div className="grid gap-4 xl:grid-cols-2">
                            {signups ? (
                                <SignupsChart signups={signups} />
                            ) : (
                                <SignupsChartSkeleton />
                            )}
                            {recentUsers ? (
                                <RecentUsersTable recentUsers={recentUsers} />
                            ) : (
                                <RecentUsersTableSkeleton />
                            )}
                        </div>
                    </>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>You're all set</CardTitle>
                            <CardDescription>
                                There's nothing to show here yet. Use the
                                sidebar to get around, or update your profile in
                                settings.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </div>
        </>
    );
}

function StatCards({ stats }: { stats?: DashboardStats }) {
    if (!stats) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }, (_, index) => (
                    <StatCardSkeleton key={index} />
                ))}
            </div>
        );
    }

    const activeShare =
        stats.total_users > 0 ? stats.active_users / stats.total_users : 0;

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                title="Total users"
                value={stats.total_users}
                icon={Users}
                description={`+${stats.new_this_month} this month`}
            />
            <StatCard
                title="Active users"
                value={stats.active_users}
                icon={UserCheck}
                description={`${percentFormatter.format(activeShare)} of all users`}
            />
            <StatCard
                title="Inactive users"
                value={stats.inactive_users}
                icon={UserX}
                description="Can't sign in until reactivated"
            />
            <StatCard
                title="New this month"
                value={stats.new_this_month}
                icon={UserPlus}
                description={<MonthOverMonth stats={stats} />}
            />
        </div>
    );
}

function MonthOverMonth({ stats }: { stats: DashboardStats }) {
    const { new_this_month: current, new_last_month: previous } = stats;

    if (previous === 0) {
        return <span>No sign-ups last month</span>;
    }

    const change = (current - previous) / previous;
    const TrendIcon = change >= 0 ? TrendingUp : TrendingDown;

    return (
        <>
            <TrendIcon className="size-3.5" aria-hidden />
            <span>
                {change >= 0 ? '+' : ''}
                {percentFormatter.format(change)} vs last month
            </span>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
