<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class ProyekController extends Controller
{
 public function index($id) {
    return Inertia::render('pageProyek/Kanban', [
        'dashboardId' => $id,
        'activePage' => 'tugasPage'
    ]);
}

    public function showCard($id, $cardId){
    // $id = dashboard id (parent)
    // $cardId = id dari card yang ingin ditampilkan
    return inertia('Card/Card_kanban', [
        'dashboardId' => $id,
        'cardId' => $cardId,
        // 'cardTitle' => $cardTitle
        // tambahkan data lain yang dibutuhkan
    ]);
}

public function ringkas ($id) {
    return Inertia::render('pageProyek/Rinkas', [
        'dashboardId' => $id,
        'activePage' => 'ringkasPage'
    ]);
}


public function chatgrup ($id) {
    return Inertia::render('pageProyek/ChatGrup', [
        'dashboardId' => $id,
        'activePage' => 'chatGrupPage'
    ]);
}

public function laporan ($id) {
    return Inertia::render('pageProyek/Laporan', [
        'dashboardId' => $id,
        'activePage' => 'laporanPage'
    ]);
}
}
