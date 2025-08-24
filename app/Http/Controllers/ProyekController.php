<?php

namespace App\Http\Controllers;

use App\Models\timPerusahaan\Anggota_card;
use App\Models\timPerusahaan\Anggota_tim;
use App\Models\timPerusahaan\Card_listModel;
use App\Models\timPerusahaan\Kalender;
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
                    $query->orderBy('urutan', 'asc')
                    ->with('anggota_card_list.user', 'anggota_card_list.anggota_tim');
                }])
                ->where('id_board', $id_board)
                ->orderBy('urutan_posisi', 'asc')
                ->get();

        return Inertia::render('pageProyek/Kanban', [
            'dashboardId' => $id,
            'id_tim' => $id_tim,
            'id_board' => $id_board,
            'activePage' => 'tugasPage',
            'tim' => $tim,
            'dataBoard' => $board_data,
        ]);
    }

    // card store
    public function storeCard(Request $request, $id, $id_tim, $id_board){
      $user = Auth::user();
        if(!$user){
            return response()->json(['error' => 'user tidak terkait dengan perusahaan'], 403);
        }
    // Validasi input
    $request->validate([
        'nama_tugas' => 'required|string|max:50',
        'id_list' => 'required|string|max:36|exists:list_board,id',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
    ]);

    try {

       $anggota_tim = $user->anggota_tim
        ->where('id_tim_perusahaan', $id_tim)
        ->first();

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

        $card->anggota_card_list()->create([
            'id' => (string) Str::uuid(),
            'id_user' => $user->id,
            'id_card' => $card->id,
            'id_anggota_tim' => $anggota_tim->id,
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
        $kalender = Kalender::where('id_card', $cardId)->first();
        return inertia('Card/Card_kanban', [
            'id_tim' => $id_tim,
            'card_id' => $cardId,
            'kalender' => $kalender
        ]);
    }

    // Tambah Anggota Card
    public function tambah_anggota_card ($id, $id_user, $cardId) {
        $id_anggota_tim = Anggota_tim::where('id_users', $id)->first();

        Anggota_card::create([
            'id' => (string) Str::uuid(),
            'id_user' => $id_user,
            'id_card' => $cardId,
            'id_anggota_tim' => $id_anggota_tim->id
        ]);

        return redirect()->back()->with('success', 'Berhasil Menambahkan Anggota');
    }

    // Delete anggota Card
    public function destroy_anggota_card ($id, $id_user) {
        Anggota_card::where('id_user', $id_user)->delete();
    }
    

    public function ringkas ($id, $id_tim) {
        $tim = TimPerusahaan::findOrFail($id_tim);
        return Inertia::render('pageProyek/Rinkas', ['dashboardId' => $id, 'activePage' => 'ringkasPage', 'tim' => $tim]);
    }

    public function chatgrup ($id, $id_tim) {
        $tim = TimPerusahaan::findOrFail($id_tim);
        return Inertia::render('pageProyek/ChatGrup', ['dashboardId' => $id, 'activePage' => 'chatGrupPage', 'tim' => $tim]);
    }

    public function laporan ($id, $id_tim) {
        $tim = TimPerusahaan::findOrFail($id_tim);
        return Inertia::render('pageProyek/Laporan', ['dashboardId' => $id, 'activePage' => 'laporanPage', 'tim' => $tim]);
    }

    public function updateListOrder(Request $request) {
        $request->validate(['lists' => 'required|array', 'lists.*.id' => 'required|string', 'lists.*.urutan_posisi' => 'required|integer']);
        foreach ($request->lists as $list) {
            List_boardModel::where('id', $list['id'])->update(['urutan_posisi' => $list['urutan_posisi']]);
        }
        return redirect()->back()->with('success', 'List berhasil di pindahkan');
    }

    public function updateCardOrder(Request $request) {
        $request->validate(['cards' => 'required|array', 'cards.*.id' => 'required|string', 'cards.*.urutan' => 'required|integer', 'cards.*.id_list' => 'required|string']);
        foreach ($request->cards as $card) {
            Card_listModel::where('id', $card['id'])->update(['urutan' => $card['urutan'], 'id_list' => $card['id_list']]);
        }
        return redirect()->back()->with('success', 'Card berhasil di pindahkan');
    }

    // --- FUNGSI BARU UNTUK MENAMBAH ANGGOTA TIM ---
    public function tambahAnggota(Request $request, $id, $id_tim) {
        // Validasi defensif untuk memastikan ID tim valid
        $tim = TimPerusahaan::find($id_tim);
        if (!$tim) {
            return response()->json(['message' => 'Tim perusahaan dengan ID yang diberikan tidak ditemukan.'], 404);
        }

        $request->validate([
            'id_users' => 'required|string|exists:users,id',
            'role_anggota' => 'required|string|in:Member,Ketua tim',
        ]);

        try {
            $isExist = Anggota_tim::where('id_users', $request->id_users)
                                   ->where('id_tim_perusahaan', $id_tim)
                                   ->exists();
            if ($isExist) {
                return response()->json(['message' => 'Anggota sudah terdaftar di tim ini.'], 422);
            }

            Anggota_tim::create([
                'id' => (string) Str::uuid(),
                'id_users' => $request->id_users,
                'role_anggota' => $request->role_anggota,
                'id_tim_perusahaan' => $id_tim,
            ]);

            return redirect()->back()->with('success', 'Anggota tim berhasil ditambahkan.');
        } catch (\Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan server: ' . $e->getMessage()], 500);
        }
    }
    
    // fungsi delet
    public function hapusAnggota($id, $id_tim, $id_user) {
        try {
            // Cari anggota tim yang sesuai berdasarkan id_tim_perusahaan dan id_users
            $anggota = Anggota_tim::where('id_tim_perusahaan', $id_tim)
                                   ->where('id_users', $id_user)
                                   ->first();

            // Jika anggota tidak ditemukan, kembalikan response error
            if (!$anggota) {
                return response()->json(['message' => 'Anggota tidak ditemukan di tim ini.'], 404);
            }
            $anggota->delete();
            return response()->json(['message' => 'Anggota tim berhasil dihapus.'], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan server: ' . $e->getMessage()], 500);
        }
    }

    public function kalender_store (Request $request, $id, $cardId) {

        $validated = $request->validate([
            'start_date' => 'nullable||date',
            'due_date' => 'nullable||date',
            'due_time' => 'nullable',
            'reminder' => 'nullable||string',
        ]);

        $kalender = Kalender::create([
            'id' => (string) Str::uuid(),
            'id_card' => $cardId,
            'start_date' => $validated['start_date'],
            'due_date' => $validated['due_date'],
            'due_time' => $validated['due_time'],
            'reminder' => $validated['reminder'],
        ]);

        return redirect()->back()->with('success', 'berhasil menambahkan waktu');
    }

    public function kalender_update (Request $request, $id, $kalender_id) {
        $validated = $request->validate([
            'start_date' => 'nullable||date',
            'due_date' => 'nullable||date',
            'due_time' => 'nullable',
            'reminder' => 'nullable||string',
        ]);


        $kalender = Kalender::findOrFail($kalender_id);

        $kalender->update($validated);

        return redirect()->back()->with("seccess", 'Berhasil Update');
    }
}