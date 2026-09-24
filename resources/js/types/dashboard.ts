export type DashboardStats = {
    total_users: number;
    active_users: number;
    inactive_users: number;
    new_this_month: number;
    new_last_month: number;
};

export type MonthlySignups = {
    /** Month key in `YYYY-MM` format. */
    month: string;
    total: number;
};

export type RecentUser = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    roles: string[];
    is_active: boolean;
    created_at: string | null;
};
