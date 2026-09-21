import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Shield, Users } from 'lucide-react';
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
import { PERMISSIONS } from '@/constants/permissions';
import { usePermissions } from '@/hooks/use-permissions';
import { dashboard } from '@/routes';
import roles from '@/routes/roles';
import users from '@/routes/users';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const accessControlItems: NavItem[] = [
    {
        title: 'Users',
        href: users.index(),
        icon: Users,
        permission: PERMISSIONS.USERS_VIEW,
    },
    {
        title: 'Roles',
        href: roles.index(),
        icon: Shield,
        permission: PERMISSIONS.ROLES_VIEW,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/monciego/tachi-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://github.com/monciego/tachi-kit',
        icon: BookOpen,
    },
];

function isNavItemVisible(
    item: NavItem,
    can: (permission: NonNullable<NavItem['permission']>) => boolean,
    userRoles: string[],
): boolean {
    return (
        (!item.permission || can(item.permission)) &&
        (!item.role || userRoles.includes(item.role))
    );
}

export function AppSidebar() {
    const { can } = usePermissions();
    const { auth } = usePage().props;

    const userRoles = auth.roles.map((role) => role.name);
    const isVisible = (item: NavItem) => isNavItemVisible(item, can, userRoles);

    const visibleMainNav = mainNavItems.filter((item) => isVisible(item));
    const visibleAccessControl = accessControlItems.filter((item) =>
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
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
