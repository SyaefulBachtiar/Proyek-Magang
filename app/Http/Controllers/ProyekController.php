<?php

namespace App\Http\Controllers;

use App\Events\BoardUpdated;
use App\Events\LabelCard;
use App\Events\LabelTim;
use App\Events\NotifikasiEvent;
use App\Models\timPerusahaan\Anggota_card;
use App\Models\timPerusahaan\Anggota_tim;
use App\Models\timPerusahaan\BoardModel;
use App\Models\timPerusahaan\Card_listModel;
use App\Models\timPerusahaan\Checklist;
use App\Models\timPerusahaan\Kalender;
use App\Models\timPerusahaan\Label_card;
use App\Models\timPerusahaan\Label_tim;
use App\Models\timPerusahaan\List_boardModel;
use App\Models\timPerusahaan\Notifikasi;
use App\Models\timPerusahaan\TimPerusahaan;
use App\Models\timPerusahaan\Title_Checklist;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
                    ->with('anggota_card_list.user', 'anggota_card_list.anggota_tim', 'label_card', 'kalender', 'title_checklist.checklist')
                    ->withCount('checklist')
                    ->withCount(['checklist as completed_checklist_count' => function ($query){
                        $query->where('is_checked', true);
                    }]);
                }])
                ->where('id_board', $id_board)
                ->orderBy('urutan_posisi', 'asc')
                ->get();
        
        $user = Auth::user();
        
        $nama_perusahaan = $user->anggotaPerusahaan?->perusahaan?->nama_perusahaan;

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

        $this->broadcastBoardUpdate($id_board);

        return back()->with('success', 'Berhasil Menambahkan Card');

    } catch (\Exception $e) {
        return redirect()->back()->with('gagal', 'Gagal Menambahkan Card: '. $e);

    }
}

     // list store
    public function storeList (Request $request, $id, $id_board) {

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

        $this->broadcastBoardUpdate($id_board);

        return back()->with('success', 'Berhasil tambah list');
    }catch(\Exception $e){
        return redirect()->back()->with('gagal', 'Gagal Menambahkan list: '. $e);
    }
    }

    public function showCard($id, $id_tim,  $cardId ) {
        $kalender = Kalender::where('id_card', $cardId)->first();
        $label_tim = Label_tim::where('id_tim_perusahaan', $id_tim)->get();
        $label_card = Label_card::where('id_card', $cardId)->get();
        $id_board = BoardModel::where('id_team', $id_tim)->value('id');
        $dataCard = Card_listModel::where('id', $cardId)->firstOrFail();
        $title_checklist = Title_Checklist::where('id_tim_perusahaan', $id_tim)->get();
        $checklist = Title_Checklist::with(['checklist' => function ($query) use ($cardId){
            $query->where('id_card', $cardId);
        }])->where('id_card', $cardId)->get();

        $user = Auth::user();

         $perusahaan_id = $user->anggotaPerusahaan->perusahaan_id;

        $tim = User::with('anggotaPerusahaan')
        ->whereHas('anggotaPerusahaan', function ($query) use ($perusahaan_id){
            $query->where('perusahaan_id', $perusahaan_id);
        })->get();

        $formatedTim = $tim->map(function ($anggota) {
            return [
                'id' => $anggota->id,
                'name' => $anggota->name,
                'email' => $anggota->email,
                'role_anggota' => $anggota->anggotaPerusahaan->role_anggota ?? null,
            ];
        });

        return inertia('Card/Card_kanban', [
            'id_tim' => $id_tim,
            'card_id' => $cardId,
            'kalender' => $kalender,
            'label_tim' => $label_tim,
            'label_card' => $label_card,
            'id_board' => $id_board,
            'anggota_tim' => $formatedTim,
            'dataCard' => $dataCard,
            'title_checklist' => $title_checklist,
            'checklist' => $checklist,
        ]);
    }

    // Tambah Anggota Card
    public function tambah_anggota_card (Request $request, $id, $id_user, $cardId) {
        $id_anggota_tim = Anggota_tim::where('id_users', $id)->first();
        $card = Card_listModel::findOrFail($cardId);

        try{
            Anggota_card::create([
                'id' => (string) Str::uuid(),
                'id_user' => $id_user,
                'id_card' => $cardId,
                'id_anggota_tim' => $id_anggota_tim->id
            ]);
            
            $userYangMenambahkan = User::where('id', $id)->value('name');
            Notifikasi::create([
                'id' => (string) Str::uuid(),
                'user_id' => $id_user,
                'title' => 'Anda Di Tambahkan ke Tim Baru',
                'message' => "Anda telah ditambahkan ke tim '{$card->nama_card}' oleh {$userYangMenambahkan}."
            ]);
    
            $id_board = $card->listBoard->id_board;
            
            broadcast(new NotifikasiEvent($id_user));

            $this->broadcastBoardUpdate($id_board);
    
            return redirect()->back()->with('success', 'Berhasil Menambahkan Anggota');

        }catch (\Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan server: ' . $e->getMessage()], 500);
        }
    }

    // Delete anggota Card
    public function destroy_anggota_card ($id, $id_user, $cardId) {
        
        try{
            $anggotaCard = Anggota_card::where('id_card', $cardId)
                                   ->where('id_user', $id_user);
    
            if($anggotaCard->doesntExist()){
                 return back()->with('gagal', 'Anggota tidak ditemukan pada kartu ini.');
            }
    
            $anggotaCard->delete();
    
            $card = Card_listModel::findOrFail($cardId);
            $id_board = $card->listBoard->id_board;
            
            broadcast(new NotifikasiEvent($id_user));

            $this->broadcastBoardUpdate($id_board);
    
            return back()->with('success', 'Berhasil mengeluarkan anggota');

        }catch (\Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan server: ' . $e->getMessage()], 500);
        }
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

    private function broadcastBoardUpdate ($id_board) {

        // Siarkan ke semua event client
        broadcast(new BoardUpdated($id_board));
    }

    public function updateListOrder(Request $request, $id) {
        $request->validate([
        'id_board' => 'required',
        'lists' => 'required|array',
        'lists.*.id' => 'required|string',
        'lists.*.urutan_posisi' =>'required|integer'
    ]);
        foreach ($request->lists as $list) {
            List_boardModel::where('id', $list['id'])->update(['urutan_posisi' => $list['urutan_posisi']]);
        }

        // Panggil dari boradcast
        $this->broadcastBoardUpdate($request->id_board);

        return redirect()->back()->with('success', 'List berhasil di pindahkan');
    }

    public function updateCardOrder(Request $request, $id) {
        $request->validate([
            'id_board' => 'required',
            'cards' => 'required|array', 
            'cards.*.id' => 'required|string', 
            'cards.*.urutan' => 'required|integer', 
            'cards.*.id_list' => 'required|string'
        ]);
        foreach ($request->cards as $card) {
            Card_listModel::where('id', $card['id'])->update(['urutan' => $card['urutan'], 'id_list' => $card['id_list']]);
        }

        // Panggil dari boradcast
        $this->broadcastBoardUpdate($request->id_board);

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
            $userYangMenambahkan = $request->user();
            Notifikasi::create([
                'id' => (string) Str::uuid(),
                'user_id' => $request->id_users,
                'title' => 'Anda Di Tambahkan ke Tim Baru',
                'message' => "Anda telah ditambahkan ke tim '{$tim->nama_tim}' oleh {$userYangMenambahkan->name}."
            ]);

            broadcast(new NotifikasiEvent($request->id_users));

            return response()->json([
            'message' => 'Anggota tim berhasil ditambahkan.'
            ], 201);
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

            Anggota_card::where('id_user', $anggota->id_users)->delete();

            $anggota->delete();

            broadcast(new NotifikasiEvent($id_user));

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

        Kalender::create([
            'id' => (string) Str::uuid(),
            'id_card' => $cardId,
            'start_date' => $validated['start_date'],
            'due_date' => $validated['due_date'],
            'due_time' => $validated['due_time'],
            'reminder' => $validated['reminder'],
        ]);

        $card = Card_listModel::findOrFail($cardId);

        $id_board = $card->listBoard->id_board;

        $this->broadcastBoardUpdate($id_board);

        return back()->with('success', 'berhasil menambahkan waktu');
    }

    public function kalender_update (Request $request, $id, $kalender_id) {
        $validated = $request->validate([
            'start_date' => 'nullable||date',
            'due_date' => 'nullable||date',
            'due_time' => 'nullable',
            'reminder' => 'nullable||string',
        ]);


        $kalender = Kalender::findOrFail($kalender_id);
        $id_board = $kalender->card->listBoard->id_board;
        $kalender->update($validated);

        $this->broadcastBoardUpdate($id_board);
        
        return back()->with("seccess", 'Berhasil Update');
    }

    public function kalender_delete ($id, $kalender_id) {
        
        // Kalender::where('id', $kalender_id)->delete();
        $kalender = Kalender::findOrFail($kalender_id);

        $id_board = $kalender->card->listBoard->id_board;

        $kalender->delete();

        $this->broadcastBoardUpdate($id_board);

        return back()->with('success', 'Berhasil hapus');
    }

    public function label_store (Request $request, $id, $id_card, $id_tim) {

        $request->validate([
            'title' => 'required|string',
            'warna' => 'required|string'
        ]);

        try{
        //     Label_card::create([
        //     'id' => (string) Str::uuid(),
        //     'title' => $request->title,
        //     'warna' => $request->warna,
        //     'id_card' => $id_card
        // ]);

       $label = Label_tim::create([
            'id' => (string) Str::uuid(),
            'title' => $request->title,
            'warna' => $request->warna,
            'id_tim_perusahaan' => $id_tim
        ]);

        $card = Card_listModel::findOrFail($id_card);
        $id_board = $card->listBoard->id_board;

        $this->broadcastBoardUpdate($id_board);

        return back()->with('success', 'Berhasil menambahkan label');
        } catch (\Error $e){
             return response()->json(['message' => 'Terjadi kesalahan server: ' . $e->getMessage()], 500);
        }
    } 

    public function label_update (Request $request, $id, $id_tim, $id_label) {
        $validated = $request->validate([
            'title' => 'required|string',
            'warna' => 'required|string'
        ]);

        $label_tim = Label_tim::where('id', $id_label)
                    ->where('id_tim_perusahaan', $id_tim)
                    ->firstOrFail();

        $label_tim->update($validated);

        $id_board = BoardModel::where('id_team', $id_tim)->value('id');
        
        $this->broadcastBoardUpdate($id_board);

        return back()->with('success', 'Berhasil update label');
    }

    public function label_delete ($id, $label_id) {
        $label = Label_tim::findOrFail($label_id);
        $id_tim = $label->id_tim_perusahaan;

        $label->delete();

        $id_board = BoardModel::where('id_team', $id_tim)->value('id');

        $this->broadcastBoardUpdate($id_board);

        return back()->with('success', 'Berhasil delete label');
    }

    public function label_card_store (Request $request, $id, $card_id) {

        $request->validate([
            'label_id' => 'required'
        ]);

        $label_tim = Label_tim::findOrFail($request->label_id);

        
        $label_card = Label_card::create([
            'id' => (string) Str::uuid(),
            'title' => $label_tim->title,
            'warna' => $label_tim->warna,
            'id_card' => $card_id,
            'id_label_tim' => $label_tim->id
        ]);

        $card = Card_listModel::findOrFail($card_id);
        $id_board = $card->listBoard->id_board;

        $this->broadcastBoardUpdate($id_board);

        return back()->with('success', 'berhasil menambahkan label');
    }

    public function label_card_delete ($id, $card_id, $label_id) {

        $label_card = Label_card::where('id_card', $card_id)
                    ->where('id_label_tim', $label_id)
                    ->firstOrFail();
        

        $label_card->delete();

        $id_board = $label_card->card->listBoard->id_board;

        $this->broadcastBoardUpdate($id_board);
        
        return response()->json(['success' => 'Berhasil delete label']);
    }

    // CHECKLIST
    public function store_checklist (Request $request, $id, $id_tim, $id_card) {
        if($request->template_id){
            $request->validate([
                    'title' => 'nullable|string|max:255',
                    'template_id' => 'nullable|string'
                ]);
        }else{
            $request->validate([
                    'title' => 'required|string|max:255',
                    'template_id' => 'nullable|string'
                ]);
        }

        try{    

            if($request->template_id){
                 $request->validate([
                'title' => 'nullable|string|max:255',
                'template_id' => 'nullable|string'
                ]);

                $chekclist_title = Title_Checklist::findOrFail($request->template_id);
                $chekclist_title->update([
                    'id_card' => $id_card
                ]);
                $chekclist_title->checklist()->update([
                    'id_card' => $id_card
                ]);
            }else{
                $chekclist_title = Title_Checklist::create([
                'id' => (string) Str::uuid(),
                'title' => $request->title,
                'id_tim_perusahaan' => $id_tim
            ]);
            }


            $id_board = BoardModel::where('id_team', $id_tim)->value('id');

            $this->broadcastBoardUpdate($id_board);
    
            return redirect()->back()->with('success', 'Berhasil menambahkan title checklist')->with('new_checklist', $chekclist_title->id);
        } catch (\Exception $e) {
         
        dd($e->getMessage()); 
    }
    }

    public function store_item_checklist (Request $request, $id, $id_card){

        $request->validate([
            'title_checklist_id' => 'required|string|exists:title_checklist,id',
            'item_text' => 'required|string|max:255',
        ]);
        
        
        try{
            Checklist::create([
                'id' => (string) Str::uuid(),
                'id_card' => $id_card,
                'id_title_checklist' => $request->title_checklist_id,
                'title' => $request->item_text,
                'is_checked' => false,
                'image' => null,
            ]);
            
            $card = Card_listModel::findOrFail($id_card);
            $id_board = $card->listBoard->id_board;

            $this->broadcastBoardUpdate($id_board);

            return redirect()->back()->with('success', 'Berhasil Menambahkan Item Checklist');

        }catch (\Exception $e) {
            return redirect()->back()->with('gagal', 'Gagal Menambahkan Item Checklist: '. $e);
        }
    }

    public function update_checklist (Request $request, $id, $checklist_id) {
        $request->validate([
            'is_checked' => 'required|boolean',
        ]);

        $checklist = Checklist::findOrFail($checklist_id);
        $checklist->update([
            'is_checked' => $request->is_checked,
        ]);

        $id_board = $checklist->card->listBoard->id_board;

        $this->broadcastBoardUpdate($id_board);

        return response()->json(['success' => 'Checklist updated successfully']);
    }

    public function update_notchecklist (Request $request, $id, $checklist_id) {
        $request->validate([
            'is_checked' => 'required|boolean',
        ]);
        
        $checklist = Checklist::findOrFail($checklist_id);
        $checklist->update([
            'is_checked' => $request->is_checked,
        ]);

        $id_board = $checklist->card->listBoard->id_board;

        $this->broadcastBoardUpdate($id_board);

        return response()->json(['success' => 'Checklist updated successfully']);
    }

    public function update_title_checklist ($id, $id_checklist) {
        $title_checklist = Title_Checklist::findOrFail($id_checklist);

        $title_checklist->checklist()->update(['id_card' => null]);
        $title_checklist->update(['id_card' => null]);

        return redirect()->back()->with('success', 'Berhasil menghapus title checklist');
    }
}