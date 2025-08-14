<?php

namespace App\Http\Controllers;

use App\Models\timPerusahaan\Card_listModel;
use App\Models\timPerusahaan\List_boardModel;
use App\Models\timPerusahaan\TimPerusahaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ProyekController extends Controller
{

    // kanban
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

    // kanban store

    // card store
    public function storeCard(Request $request, $id){
    
    // Validasi input
    $request->validate([
        'nama_tugas' => 'required|string|max:50',
        'id_list' => 'required|string|max:36|exists:list_board,id',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
    ]);

    try {
        // Generate ID unik
        $cardId = (string) Str::uuid();

        // Hitung urutan card selanjutnya dalam list
        $maxUrutan = Card_listModel::where('id_list', $request->id_list)->max('urutan');
        $urutan = $maxUrutan ? $maxUrutan + 1 : 1;

        // Handle upload gambar jika ada
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('card-images', 'public');
        }

        // Insert card baru
        Card_listModel::create([
            'id' => $cardId,
            'nama_card' => $request->nama_tugas,
            'pembuat' => Auth::user()->name, // Atau sesuaikan dengan field user
            'image' => $imagePath,
            'id_list' => $request->id_list,
            'urutan' => $urutan,
        ]);

        return redirect()->back()->with('success', 'Berhasil Menambahkan Card');

    } catch (\Exception $e) {
        return redirect()->back()->with('gagal', 'Gagal Menambahkan Card: '. $e);
    }
    }


     // list store
    public function storeList (Request $request, $id) {
         $request->validate([
        'nama_list' => 'required|string|max:50',
        'id_board' => 'required|string|max:36|exists:board_tim,id',
    ]);


    try{

        $listId = (string) Str::uuid();

        $maxUrutan = List_boardModel::where('id_board', $request->id_board)->max('urutan_posisi');
        $urutan = $maxUrutan ? $maxUrutan + 1 : 1 + 1;

        List_boardModel::create([
            'id' => $listId,
            'urutan_posisi' => $urutan,
            'judul' => $request->nama_list,
            'id_board' => $request->id_board,
        ]);

        return redirect()->back()->with('success', 'Berhasil tambah list');
    }catch(\Exception $e){
        return redirect()->back()->with('gagal', 'Gaga Menambahkan list: '. $e);
    }
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
