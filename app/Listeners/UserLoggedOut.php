<?php

namespace App\Listeners;

use App\Events\NotifikasiEvent;
use App\Models\User;
use Illuminate\Auth\Events\Logout;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Cache;

class UserLoggedOut
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }
    public function handle(Logout $event)
    {

        Cache::forget('user-is-online-' . $event->user->id);

        User::where('id', $event->user->id)->update([
            'is_online' => false,
            'last_seen' => now()
        ]);;

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