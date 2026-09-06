<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::post('users/bulk-delete', [UserController::class, 'bulkDestroy'])->name('users.bulk-delete');
    Route::patch('users/{user}/status', [UserController::class, 'updateStatus'])->name('users.update-status');
    Route::resource('users', UserController::class);
});

require __DIR__.'/settings.php';
