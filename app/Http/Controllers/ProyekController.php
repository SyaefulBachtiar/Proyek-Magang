<?php

namespace App\Http\Controllers;

use App\Models\timPerusahaan\Card_listModel;
use App\Models\timPerusahaan\List_boardModel;
use App\Models\timPerusahaan\TimPerusahaan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProyekController extends Controller
{
 public function index($id, $id_tim, $id_board) {

    $tim = TimPerusahaan::findOrFail($id_tim);
    
    if (!$tim->board_tim) {
        abort(404, 'Board tidak ditemukan');
    }

    $board_data = List_boardModel::with(['cards' => function($query) {
                // Urutkan cards berdasarkan kolom 'urutan'
                $query->orderBy('urutan', 'asc');
            }])
            ->where('id_board', $id_board)
            ->orderBy('urutan_posisi', 'asc') // Urutkan list berdasarkan urutan_posisi
            ->get();

    return Inertia::render('pageProyek/Kanban', [
        'dashboardId' => $id,
        'activePage' => 'tugasPage',
        'tim' => $tim,
        'dataBoard' => $board_data,
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

public function updateListOrder(Request $request)
{
    $request->validate([
        'lists' => 'required|array',
        'lists.*.id' => 'required|string',
        'lists.*.urutan_posisi' => 'required|integer',
    ]);

    foreach ($request->lists as $list) {
        List_boardModel::where('id', $list['id'])
            ->update(['urutan_posisi' => $list['urutan_posisi']]);
    }

    return redirect()->back()->with('success', 'List berhasil di pindahkan');
}

public function updateCardOrder(Request $request)
{
    $request->validate([
        'cards' => 'required|array',
        'cards.*.id' => 'required|string',
        'cards.*.urutan' => 'required|integer',
        'cards.*.id_list' => 'required|string',
    ]);

    foreach ($request->cards as $card) {
        Card_listModel::where('id', $card['id'])
            ->update([
                'urutan' => $card['urutan'],
                'id_list' => $card['id_list']
            ]);
    }

    return redirect()->back()->with('success', 'Card berhasil di pindahkan');
}
}
