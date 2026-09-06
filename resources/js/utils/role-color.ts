type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface RoleBadgeStyle {
    variant: BadgeVariant;
    className: string;
}

const FIXED_ROLE_STYLES: Record<string, RoleBadgeStyle> = {
    superadmin: {
        variant: 'destructive',
        className:
            'bg-red-100 text-red-700 border-red-200 dark:bg-red-800/40 dark:text-red-300 dark:border-red-700 font-normal',
    },
    admin: {
        variant: 'default',
        className:
            'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-800/40 dark:text-purple-300 dark:border-purple-700 font-normal',
    },
    user: {
        variant: 'secondary',
        className:
            'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-800/40 dark:text-blue-300 dark:border-blue-700 font-normal',
    },
};

const CUSTOM_ROLE_COLORS = [
    'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-800/40 dark:text-teal-300 dark:border-teal-700',
    'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-800/40 dark:text-orange-300 dark:border-orange-700',
    'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-800/40 dark:text-pink-300 dark:border-pink-700',
    'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-800/40 dark:text-indigo-300 dark:border-indigo-700',
    'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-800/40 dark:text-cyan-300 dark:border-cyan-700',
];

function hashRoleName(roleName: string): number {
    let hash = 0;

    for (let i = 0; i < roleName.length; i++) {
        hash = roleName.charCodeAt(i) + ((hash << 5) - hash);
    }

    return hash;
}

function getRoleStyle(roleName: string): RoleBadgeStyle {
    const normalized = roleName.toLowerCase();
    const fixed = FIXED_ROLE_STYLES[normalized];

    if (fixed) {
        return fixed;
    }

    const index =
        Math.abs(hashRoleName(normalized)) % CUSTOM_ROLE_COLORS.length;

    return {
        variant: 'secondary',
        className: CUSTOM_ROLE_COLORS[index],
    };
}

/**
 * Tailwind classes that style a role badge.
 * Same role name always produces the same classes.
 */
export function getRoleColor(roleName: string): string {
    return getRoleStyle(roleName).className;
}

/**
 * Badge variant that pairs with the classes returned by getRoleColor.
 */
export function getRoleBadgeVariant(roleName: string): BadgeVariant {
    return getRoleStyle(roleName).variant;
}
