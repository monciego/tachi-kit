import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavGroup } from '@/components/nav-group';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    ACCESS_CONTROL_NAV_ITEMS,
    FOOTER_NAV_ITEMS,
    MAIN_NAV_ITEMS,
    isNavItemVisible,
} from '@/constants/navigation';
import { usePermissions } from '@/hooks/use-permissions';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { can } = usePermissions();
    const { auth } = usePage().props;

    const userRoles = auth.roles.map((role) => role.name);
    const isVisible = (item: NavItem) => isNavItemVisible(item, can, userRoles);

    const visibleMainNav = MAIN_NAV_ITEMS.filter((item) => isVisible(item));
    const visibleAccessControl = ACCESS_CONTROL_NAV_ITEMS.filter((item) =>
        isVisible(item),
    );

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavGroup label="Platform" items={visibleMainNav} />
                <NavGroup label="Access Control" items={visibleAccessControl} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={FOOTER_NAV_ITEMS} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
