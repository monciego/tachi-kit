<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\AvatarUpdateRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AvatarController extends Controller
{
    /**
     * Upload a new avatar, replacing the current one.
     */
    public function update(AvatarUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        $this->deleteStoredAvatar($user);

        $user->forceFill([
            'avatar_path' => $request->file('avatar')->store('avatars', config('tachi.avatars.disk')),
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Avatar updated.')]);

        return to_route('profile.edit');
    }

    /**
     * Remove the current avatar.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();

        $this->deleteStoredAvatar($user);

        $user->forceFill(['avatar_path' => null])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Avatar removed.')]);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's current avatar file, if they have one.
     */
    private function deleteStoredAvatar(User $user): void
    {
        if ($user->avatar_path) {
            Storage::disk(config('tachi.avatars.disk'))->delete($user->avatar_path);
        }
    }
}
