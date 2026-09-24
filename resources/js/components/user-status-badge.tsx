import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function UserStatusBadge({ active }: { active: boolean }) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'shrink-0 rounded-full border-transparent font-normal',
                active
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400',
            )}
        >
            {active ? 'Active' : 'Inactive'}
        </Badge>
    );
}
