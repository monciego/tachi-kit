import { PERMISSION_LABELS } from '@/constants/access.generated';
import type { PermissionName } from '@/types/permissions';

export {
    PERMISSION_GROUPS,
    PERMISSION_LABELS,
    PERMISSIONS,
} from '@/constants/access.generated';

export function getPermissionLabel(permission: PermissionName): string {
    return PERMISSION_LABELS[permission];
}
