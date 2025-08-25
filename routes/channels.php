<?php

use App\Models\timPerusahaan\BoardModel;
use App\Models\timPerusahaan\TimPerusahaan;
use Illuminate\Support\Facades\Broadcast;

// Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
//     return (int) $user->id === (int) $id;
// });

Broadcast::channel('board.{id_board}', function ($user, $id_board) { 
    $board = BoardModel::find($id_board);

    if(!$board){
        return false;
    }

    return TimPerusahaan::where('id', $board->id_team)
            ->whereHas('anggota_tim_perusahaan', function ($query) use ($user) {
            $query->where('id_users', $user->id);
        })->exists();
});