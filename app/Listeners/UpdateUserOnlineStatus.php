<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UpdateUserOnlineStatus
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
  public function handle(Login $event)
    {
        /** @var User $user */
        $user = $event->user;

        $user->update([
            'is_online' => true,
            'last_seen' => now()
        ]);
    }
}
