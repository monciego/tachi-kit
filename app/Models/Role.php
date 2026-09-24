<?php

namespace App\Models;

use App\Enums\RoleName;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Spatie\Permission\Models\Role as SpatieRole;

/**
 * @property-read Collection<int, User> $users
 */
class Role extends SpatieRole
{
    /**
     * Check if this is a system role
     */
    public function isSystemRole(): bool
    {
        return RoleName::tryFrom($this->name) !== null;
    }

    /**
     * Order system roles first (superadmin, admin, user), then everything else.
     *
     * @param  Builder<self>  $query
     */
    #[Scope]
    protected function systemRolesFirst(Builder $query): void
    {
        $query->orderByRaw(
            'CASE name WHEN ? THEN 0 WHEN ? THEN 1 WHEN ? THEN 2 ELSE 3 END',
            RoleName::values(),
        );
    }
}
