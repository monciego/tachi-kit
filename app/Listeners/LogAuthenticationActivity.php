<?php

namespace App\Listeners;

use App\Enums\ActivityEvent;
use App\Models\User;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Laravel\Fortify\Fortify;

/**
 * Records sign-ins, sign-outs and failed sign-in attempts in the activity log.
 * Methods are auto-discovered by their event type hints.
 */
class LogAuthenticationActivity
{
    /**
     * Record a successful sign-in (password, passkey or remember-me).
     */
    public function handleLogin(Login $event): void
    {
        if ($event->user instanceof User) {
            ActivityEvent::Login->log(causer: $event->user);
        }
    }

    /**
     * Record a sign-out. Sessions that expired without a user are skipped.
     */
    public function handleLogout(Logout $event): void
    {
        if ($event->user instanceof User) {
            ActivityEvent::Logout->log(causer: $event->user);
        }
    }

    /**
     * Record a failed sign-in with the attempted email only (never the
     * password). When the email belongs to an account, that user is the actor.
     */
    public function handleFailed(Failed $event): void
    {
        $email = (string) ($event->credentials[Fortify::username()] ?? '');

        $user = $event->user instanceof User
            ? $event->user
            : User::query()->where(Fortify::username(), $email)->first();

        ActivityEvent::LoginFailed->log(properties: ['email' => $email], causer: $user);
    }
}
