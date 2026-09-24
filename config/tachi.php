<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Registration
    |--------------------------------------------------------------------------
    |
    | These settings control how new user accounts are created.
    |
    | Public registration lets any visitor sign up through the registration
    | screen. When disabled, the registration screen is blocked with a 404
    | and all public registration links across the application are hidden.
    |
    */

    'registration' => [
        'public' => env('ALLOWS_PUBLIC_REGISTRATION', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Avatars
    |--------------------------------------------------------------------------
    |
    | Profile pictures are stored on this filesystem disk. The disk must be
    | publicly reachable (run `php artisan storage:link` for the "public"
    | disk), or use a cloud disk such as "s3" in production.
    |
    */

    'avatars' => [
        'disk' => env('AVATAR_DISK', 'public'),
        'max_kilobytes' => 2048,
    ],

];
