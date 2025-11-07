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
            $namaPerusahaan = $currentUser->anggotaPerusahaan->perusahaan->nama_perusahaan;
            
            $companyUserIds = User::whereHas('anggotaPerusahaan.perusahaan', function ($query) use ($namaPerusahaan) {
                $query->where('nama_perusahaan', $namaPerusahaan);
            })->pluck('id')->toArray();
            broadcast(new NotifikasiEvent($event->user->id, $companyUserIds));
        }
    }
}
