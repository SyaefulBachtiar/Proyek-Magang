<?php

namespace App\Providers;

use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use App\Listeners\UserLoggedIn;
use App\Listeners\UserLoggedOut;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Login::class  => [
            UserLoggedIn::class,
        ],
        Logout::class => [
            UserLoggedOut::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
