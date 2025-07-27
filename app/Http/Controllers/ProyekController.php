<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProyekController extends Controller
{
 public function index($id) {
    return Inertia::render('Proyek', [
        'dashboardId' => $id,
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
}
