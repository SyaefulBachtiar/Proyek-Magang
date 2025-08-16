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
                    $query->orderBy('urutan', 'asc');
                }])
                ->where('id_board', $id_board)
                ->orderBy('urutan_posisi', 'asc')
                ->get();

        return Inertia::render('pageProyek/Kanban', [
            'dashboardId' => $id,
            'activePage' => 'tugasPage',
            'tim' => $tim,
            'dataBoard' => $board_data,
        ]);
    }

    // card store
    public function storeCard(Request $request, $id){
        $request->validate([
            'nama_tugas' => 'required|string|max:50',
            'id_list' => 'required|string|max:36|exists:list_board,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);
        try {
            $cardId = (string) Str::uuid();
            $maxUrutan = Card_listModel::where('id_list', $request->id_list)->max('urutan');
            $urutan = $maxUrutan ? $maxUrutan + 1 : 1;
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('card-images', 'public');
            }
            Card_listModel::create([
                'id' => $cardId,
                'nama_card' => $request->nama_tugas,
                'pembuat' => Auth::user()->name,
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
        $user = User::with(['tim_perusahaan.anggota_tim_perusahaan.user'])->findOrFail($id);
        $tim = $user->tim_perusahaan->firstWhere('id', $id_tim);
        $data = [];
        if ($tim) {
            $data = $tim->anggota_tim_perusahaan->map(fn($anggota) => [
                        'id' => $anggota->user->id ?? null,
                        'name' => $anggota->user->name ?? ''
                    ])->toArray();
        }
        return inertia('Card/Card_kanban', ['anggota_tim' => $data]);
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
}