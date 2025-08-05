<?php

namespace App\Http\Controllers;

use App\Models\timPerusahaan\TimPerusahaan;
use Inertia\Inertia;

class ProyekController extends Controller
{
 public function index($id, $id_tim) {

    $tim = TimPerusahaan::findOrFail($id_tim);

    return Inertia::render('pageProyek/Kanban', [
        'dashboardId' => $id,
        'activePage' => 'tugasPage',
        'tim' => $tim,
    ]);
}

    public function showCard($id, $id_tim,  $cardId ) {
    $tim = TimPerusahaan::findOrFail($id_tim);
    // $id = dashboard id (parent)
    // $cardId = id dari card yang ingin ditampilkan
    return inertia('Card/Card_kanban', [
        'dashboardId' => $id,
        'cardId' => $cardId,
        'tim' => $tim,
        // 'cardTitle' => $cardTitle
        // tambahkan data lain yang dibutuhkan
    ]);
}

public function ringkas ($id, $id_tim) {

    $tim = TimPerusahaan::findOrFail($id_tim);

    return Inertia::render('pageProyek/Rinkas', [
        'dashboardId' => $id,
        'activePage' => 'ringkasPage',
        'tim' => $tim
    ]);
}


public function chatgrup ($id, $id_tim) {
    $tim = TimPerusahaan::findOrFail($id_tim);
    return Inertia::render('pageProyek/ChatGrup', [
        'dashboardId' => $id,
        'activePage' => 'chatGrupPage',
        'tim' => $tim
    ]);
}

public function laporan ($id, $id_tim) {
    $tim = TimPerusahaan::findOrFail($id_tim);
    return Inertia::render('pageProyek/Laporan', [
        'dashboardId' => $id,
        'activePage' => 'laporanPage',
        'tim' => $tim
    ]);
}
}
