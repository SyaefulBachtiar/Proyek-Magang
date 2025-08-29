<?php

use App\Models\timPerusahaan\BoardModel;
use App\Models\timPerusahaan\Card_listModel;
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

    return TimPerusahaan::where('id', $board->id_team)->exists();
});

Broadcast::channel('labelcard.{cardId}', function ($user, $cardId) {
    // 1. Temukan card beserta relasi board-nya
    $card = Card_listModel::with('listBoard.board')->find($cardId);

    // 2. Jika card atau board tidak ditemukan, tolak akses
    if (!$card || !$card->listBoard) {
        return false;
    }

    // 3. Ambil ID tim dari board
    $teamId = $card->listBoard->board->id_team;

    // 4. Gunakan logika yang sama untuk mengecek keanggotaan user di tim tersebut
    return TimPerusahaan::where('id', $teamId)->exists();
});


Broadcast::channel('labeltim.{timId}', function ($user, $timId) {
    // Logikanya lebih sederhana, langsung cek keanggotaan user pada timId yang diberikan
    return TimPerusahaan::where('id', $timId)->exists();
});

