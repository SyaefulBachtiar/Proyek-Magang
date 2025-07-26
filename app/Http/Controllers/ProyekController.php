<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProyekController extends Controller
{
      public function index(Request $request, $id) { // <-- Terima $request dan $id
        return Inertia::render('Proyek', [
            // Kirim props ini dari query URL jika ada
            'dashboardId' => $id,
            'cardId' => $request->input('cardId'),
            'cardTitle' => $request->input('cardTitle'),
        ]);
    }

//     public function showCard($id, $cardId, $cardTitle){
//     // $id = dashboard id (parent)
//     // $cardId = id dari card yang ingin ditampilkan
//     return inertia('Card/Card_kanban', [
//         'dashboardId' => $id,
//         'cardId' => $cardId,
//         'cardTitle' => $cardTitle
//         // tambahkan data lain yang dibutuhkan
//     ]);
// }
}
