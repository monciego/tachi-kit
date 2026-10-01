import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

/**
 * The Tachi Kit wordmark: 太刀 ("tachi", the Japanese long sword), set in a
 * serif Japanese typeface. Size it with text utilities, e.g. `text-2xl`.
 */
export default function AppLogoIcon({
    className,
    ...props
}: HTMLAttributes<HTMLSpanElement>) {
    return (
        <span
            lang="ja"
            aria-hidden
            className={cn(
                'font-logo inline-block leading-none font-bold tracking-tight select-none',
                className,
            )}
            {...props}
        >
            太刀
        </span>
    );
}
