import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { RoleUser } from '@/types/role';

interface UserAvatarStackProps {
    users?: RoleUser[];
    count: number;
    maxVisible?: number;
}

export function UserAvatarStack({
    users = [],
    count,
    maxVisible = 3,
}: UserAvatarStackProps) {
    const visibleUsers = users.slice(0, maxVisible);
    const remainingCount = count - maxVisible;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (count === 0) {
        return (
            <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                    No users
                </Badge>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {/* Avatar Stack */}
            <div className="flex -space-x-2">
                {visibleUsers.map((user, index) => (
                    <TooltipProvider key={user.id || index}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Avatar className="border-foreground/30 h-8 w-8 border">
                                    <AvatarImage
                                        src={
                                            user.avatar
                                                ? `/storage/${user.avatar}`
                                                : undefined
                                        }
                                        alt={user.name}
                                    />
                                    <AvatarFallback className="text-xs">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">{user.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}

                {/* Remaining Count */}
                {remainingCount > 0 && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium">
                                    +{remainingCount}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">
                                    {remainingCount} more{' '}
                                    {remainingCount === 1 ? 'user' : 'users'}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>

            {/* Total Count Badge */}
            <Badge variant="outline" className="font-mono text-xs">
                {count}
            </Badge>
        </div>
    );
}
