<?php

namespace App\Http\Controllers;

use App\Models\timPerusahaan\Anggota_tim;
use App\Models\timPerusahaan\Card_listModel;
use App\Models\timPerusahaan\List_boardModel;
use App\Models\timPerusahaan\TimPerusahaan;
use App\Models\User;
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
      $user = Auth::user();
        if(!$user){
            return response()->json(['error', 'user tidak terkait dengan perusahaan'], 403);
        }
    // Validasi input
    $request->validate([
        'nama_tugas' => 'required|string|max:50',
        'id_list' => 'required|string|max:36|exists:list_board,id',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
    ]);

    try {

        // Hitung urutan card selanjutnya dalam list
        $maxUrutan = Card_listModel::where('id_list', $request->id_list)->max('urutan');
        $urutan = $maxUrutan ? $maxUrutan + 1 : 1;

        // Handle upload gambar jika ada
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('card-images', 'public');
        }

        // Insert card baru
        $card = Card_listModel::create([
            'id' => (string) Str::uuid(),
            'nama_card' => $request->nama_tugas,
            'pembuat' => $user->name,
            'image' => $imagePath,
            'id_list' => $request->id_list,
            'urutan' => $urutan,
        ]);

        $card->anggota_card()->create([
            'id' => (string) Str::uuid(),
            'id_user' => $user->id,
            'id_card' => $card->id
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



        $maxUrutan = List_boardModel::where('id_board', $request->id_board)->max('urutan_posisi');
        $urutan = $maxUrutan ? $maxUrutan + 1 : 1 + 1;

        List_boardModel::create([
            'id' => (string) Str::uuid(),
            'urutan_posisi' => $urutan,
            'judul' => $request->nama_list,
            'id_board' => $request->id_board,
        ]);

        return redirect()->back()->with('success', 'Berhasil tambah list');
    }catch(\Exception $e){
        return redirect()->back()->with('gagal', 'Gagal Menambahkan list: '. $e);
    }
    }

    public function showCard($id, $id_tim,  $cardId ) {

         // Ambil hanya nama user dari anggota tim
        $user = User::with([
            'tim_perusahaan.anggota_tim_perusahaan.user'
        ])->findOrFail($id);
        
       // Cari tim sesuai id_tim yang ada di parameter
        $tim = $user->tim_perusahaan->firstWhere('id', $id_tim);

          // Kalau tim ditemukan, ambil nama anggotanya
        $data = [];
        if ($tim) {
            $data = $tim->anggota_tim_perusahaan
                ->map(fn($anggota) => [
                    'id' => $anggota->user->id ?? null,
                    'name' => $anggota->user->name ?? ''
                ])
                ->toArray();
        }


    return inertia('Card/Card_kanban', [
        'anggota_tim' => $data
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
