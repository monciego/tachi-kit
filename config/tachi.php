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

];
