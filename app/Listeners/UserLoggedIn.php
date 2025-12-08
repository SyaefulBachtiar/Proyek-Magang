<?php

namespace App\Listeners;

use App\Events\NotifikasiEvent;
use App\Models\User;
use Illuminate\Auth\Events\Login;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Cache;

class UserLoggedIn
{
    public function __construct()
    {
        //
    }
    public function handle(Login $event)
    {
        Cache::put('user-is-online-' . $event->user->id, true, now()->addMinutes(5));

        User::find($event->user->id)->update([
            'is_online' => true,
            'last_seen' => now()
        ]);
        $currentUser = $event->user;

        if ($currentUser && $currentUser->anggotaPerusahaan) {
            $perusahaanId = $currentUser->anggotaPerusahaan->perusahaan_id;

            $companyUserIds = User::whereHas('anggotaPerusahaan', function ($query) use ($perusahaanId) {
                $query->where('perusahaan_id', $perusahaanId);
            })->pluck('id')->toArray();
            
            broadcast(new NotifikasiEvent($event->user->id, $companyUserIds));
        }
    }
}