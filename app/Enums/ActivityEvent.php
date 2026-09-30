<?php

namespace App\Enums;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\Models\Activity;

/**
 * Every event the activity log records. Log with
 * `ActivityEvent::UserDeactivated->log($user)`; the actor and subject names
 * are stored with the entry so it stays readable after renames or deletes.
 */
enum ActivityEvent: string
{
    case UserCreated = 'user.created';

    case UserUpdated = 'user.updated';

    case UserDeleted = 'user.deleted';

    case UserActivated = 'user.activated';

    case UserDeactivated = 'user.deactivated';

    case RoleAssigned = 'user.role_assigned';

    case RoleRemoved = 'user.role_removed';

    case PasswordChanged = 'user.password_changed';

    case PermissionsChanged = 'role.permissions_changed';

    case Login = 'auth.login';

    case Logout = 'auth.logout';

    case LoginFailed = 'auth.login_failed';

    /**
     * Human-readable label, used for the event filter.
     */
    public function label(): string
    {
        return match ($this) {
            self::UserCreated => 'User created',
            self::UserUpdated => 'User updated',
            self::UserDeleted => 'User deleted',
            self::UserActivated => 'User activated',
            self::UserDeactivated => 'User deactivated',
            self::RoleAssigned => 'Role assigned',
            self::RoleRemoved => 'Role removed',
            self::PasswordChanged => 'Password changed',
            self::PermissionsChanged => 'Permission changed',
            self::Login => 'Login',
            self::Logout => 'Logout',
            self::LoginFailed => 'Failed login',
        };
    }

    /**
     * Record this event. The causer defaults to the authenticated user.
     *
     * @param  array<string, mixed>  $properties
     */
    public function log(?Model $subject = null, array $properties = [], ?User $causer = null): void
    {
        $authenticated = Auth::user();
        $causer ??= $authenticated instanceof User ? $authenticated : null;

        $logger = activity()
            ->event($this->value)
            ->withProperties([
                'causer_name' => $causer?->name,
                'subject_name' => $subject?->getAttribute('name'),
                'ip' => request()->ip(),
                ...$properties,
            ]);

        if ($subject !== null) {
            $logger->performedOn($subject);
        }

        if ($causer !== null) {
            $logger->causedBy($causer);
        } else {
            $logger->causedByAnonymous();
        }

        $logger->log($this->value);
    }

    /**
     * The sentence shown in the activity log, e.g. "Deactivated user Jane Doe".
     */
    public function describe(Activity $activity): string
    {
        $subject = (string) $activity->getProperty('subject_name', __('a deleted record'));
        $role = (string) $activity->getProperty('role', '');
        $isSelf = $activity->causer_id !== null
            && $activity->causer_type === $activity->subject_type
            && (string) $activity->causer_id === (string) $activity->subject_id;

        return match ($this) {
            self::UserCreated => $isSelf ? __('Created their account') : __('Created user :name', ['name' => $subject]),
            self::UserUpdated => $isSelf ? __('Updated their profile') : __('Updated user :name', ['name' => $subject]),
            self::UserDeleted => $isSelf ? __('Deleted their account') : __('Deleted user :name', ['name' => $subject]),
            self::UserActivated => __('Activated user :name', ['name' => $subject]),
            self::UserDeactivated => __('Deactivated user :name', ['name' => $subject]),
            self::RoleAssigned => __('Assigned role :role to :name', ['role' => $role, 'name' => $subject]),
            self::RoleRemoved => __('Removed role :role from :name', ['role' => $role, 'name' => $subject]),
            self::PasswordChanged => match (true) {
                $activity->getProperty('via') === 'reset' => __('Reset their password'),
                $isSelf => __('Changed their password'),
                default => __('Changed the password of :name', ['name' => $subject]),
            },
            self::PermissionsChanged => __('Changed permissions of role :name', ['name' => $subject]),
            self::Login => __('Logged in'),
            self::Logout => __('Logged out'),
            self::LoginFailed => $activity->getProperty('reason') === 'inactive'
                ? __('Failed login attempt for :email (account inactive)', ['email' => (string) $activity->getProperty('email', '')])
                : __('Failed login attempt for :email', ['email' => (string) $activity->getProperty('email', '')]),
        };
    }

    /**
     * Every event as value/label pairs for the frontend filter.
     *
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            static fn (self $event): array => ['value' => $event->value, 'label' => $event->label()],
            self::cases(),
        );
    }
}
