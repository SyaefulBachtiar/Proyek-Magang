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

    /**
     * Hande the event.
     */
      public function handle(Logout $event)
    {

    Cache::forget('user-is-online-' . $event->user->id);

    User::where('id', $event->user->id)->update([
                'is_online' => false,
                'last_seen' => now()
            ]);;

        $currentUser = $event->user;
        
        if ($currentUser && $currentUser->anggotaPerusahaan) {
            $namaPerusahaan = $currentUser->anggotaPerusahaan->perusahaan->nama_perusahaan;
            
            $companyUserIds = User::whereHas('anggotaPerusahaan.perusahaan', function ($query) use ($namaPerusahaan) {
                $query->where('nama_perusahaan', $namaPerusahaan);
            })->pluck('id')->toArray();
            broadcast(new NotifikasiEvent($event->user->id, $companyUserIds));
        }
    }

}
