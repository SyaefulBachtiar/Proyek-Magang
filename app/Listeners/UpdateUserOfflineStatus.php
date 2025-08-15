<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Models\User;
use Illuminate\Auth\Events\Logout;

class UpdateUserOfflineStatus
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
   public function handle(Logout $event)
{
    /** @var User $user */
    $user = $event->user;

    $user->update([
        'is_online' => false,
        'last_seen' => now()
    ]);
}

}
