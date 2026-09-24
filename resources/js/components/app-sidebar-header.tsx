import { usePage } from '@inertiajs/react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { APP_NAV_ITEMS, isNavItemVisible } from '@/constants/navigation';
import { usePermissions } from '@/hooks/use-permissions';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { GlobalSearchDialog } from './global-search-dialog';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { can } = usePermissions();
    const { auth } = usePage().props;

    const userRoles = auth.roles.map((role) => role.name);
    const searchItems = APP_NAV_ITEMS.filter((item) =>
        isNavItemVisible(item, can, userRoles),
    );

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                <div>
                    <GlobalSearchDialog items={searchItems} />
                </div>
            </div>
        </header>
    );
}
