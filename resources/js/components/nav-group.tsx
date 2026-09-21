import { Link } from '@inertiajs/react';

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

interface NavGroupProps {
    label: string;
    items: NavItem[];
}

export function NavGroup({ label, items }: NavGroupProps) {
    const { isCurrentUrl } = useCurrentUrl();

    const getHrefString = (href: NavItem['href']): string => {
        if (!href) return '';
        if (typeof href === 'string') return href;
        return href.url || '';
    };

    const isActive = (href: NavItem['href']): boolean => {
        const path = getHrefString(href);
        if (!path) return false;

        const currentPath = window.location.pathname;

        if (isCurrentUrl(path)) return true;

        return currentPath.startsWith(path + '/');
    };

    if (!items.length) return null;

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive(item.href)}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                        {item.badge != null && item.badge > 0 && (
                            <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
