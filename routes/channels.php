<?php

use App\Models\Anggota_perusahaan;
use App\Models\Perusahaan;
use App\Models\timPerusahaan\Anggota_tim;
use App\Models\timPerusahaan\BoardModel;
use App\Models\timPerusahaan\Card_listModel;
use App\Models\timPerusahaan\TimPerusahaan;
use Illuminate\Support\Facades\Broadcast;

// Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
//     return (int) $user->id === (int) $id;
// });

Broadcast::channel('board.{id_board}', function ($user, $id_board) {
    $board = BoardModel::find($id_board);

    $tim = TimPerusahaan::find($board->id_team);
    if(!$tim){
        return false;
    }

    $isOwner = $board->tim_perusahaan->perusahaan->exists();

    $isMember = $board->tim_perusahaan->anggota_tim_perusahaan()->where('id_users', $user->id)->exists();

    return $isOwner || $isMember;
});

Broadcast::channel('user.{id_user}', function ($user, $id_user) {
    if ($user->id !== $id_user) {
        return false;
    }
    return Anggota_perusahaan::where('user_id', $id_user)->exists();
});

Broadcast::channel('company.presence.{companyId}', function ($user, $companyId) {
    if ($user->anggotaPerusahaan && $user->anggotaPerusahaan->perusahaan_id === $companyId) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'poto_profile_user' => $user->poto_profile_user,
            'jabatan' => $user->anggotaPerusahaan->jabatan,
            'role' => $user->anggotaPerusahaan->role,
        ];
    }
    // Jika tidak, tolak akses.
    return false;
});