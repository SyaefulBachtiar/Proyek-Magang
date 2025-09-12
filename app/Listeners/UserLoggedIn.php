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
         // Update cache dan database
        Cache::put('user-is-online-' . $event->user->id, true, now()->addMinutes(5));

        User::find($event->user->id)->update([
            'is_online' => true,
            'last_seen' => now()
        ]);

        // Ambil semua user dalam perusahaan yang sama
        $currentUser = $event->user;
        
        if ($currentUser && $currentUser->anggotaPerusahaan) {
            $namaPerusahaan = $currentUser->anggotaPerusahaan->perusahaan->nama_perusahaan;
            
            $companyUserIds = User::whereHas('anggotaPerusahaan.perusahaan', function ($query) use ($namaPerusahaan) {
                $query->where('nama_perusahaan', $namaPerusahaan);
            })->pluck('id')->toArray();

            // Broadcast ke semua user dalam perusahaan
            broadcast(new NotifikasiEvent($event->user->id, $companyUserIds));
        }
    }
}
