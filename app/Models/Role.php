<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    /**
     * System roles that cannot be deleted or modified
     */
    const SYSTEM_ROLES = [
        'superadmin',
        'admin',
        'user',
    ];

    /**
     * Check if this is a system role
     */
    public function isSystemRole(): bool
    {
        return in_array($this->name, self::SYSTEM_ROLES);
    }
}
