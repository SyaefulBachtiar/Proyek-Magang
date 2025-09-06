<?php

namespace App\Http\Controllers;

use App\Events\BoardUpdated;
use App\Events\NotifikasiEvent;
use App\Models\timPerusahaan\Anggota_card;
use App\Models\timPerusahaan\Anggota_tim;
use App\Models\timPerusahaan\BoardModel;
use App\Models\timPerusahaan\Card_listModel;
use App\Models\timPerusahaan\Checklist;
use App\Models\TimPerusahaan\Checklist_card;
use App\Models\TimPerusahaan\Deskripsi;
use App\Models\timPerusahaan\Kalender;
use App\Models\timPerusahaan\Label_card;
use App\Models\timPerusahaan\Label_tim;
use App\Models\timPerusahaan\List_boardModel;
use App\Models\timPerusahaan\Notifikasi;
use App\Models\timPerusahaan\TimPerusahaan;
use App\Models\timPerusahaan\Title_Checklist;
use App\Models\timPerusahaan\Title_Checklist_card;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB; // Recommended for transactions
use Illuminate\Support\Facades\Storage;

class ProyekController extends Controller
{

    // kanban
    public function index($id, $id_tim, $id_board) {
        // RECOMMENDATION: Add authorization check here.
        // e.g., if (Auth::user()->cannot('view', TimPerusahaan::find($id_tim))) { abort(403); }

        $tim = TimPerusahaan::findOrFail($id_tim);
        if (!$tim->board_tim) {
            abort(404, 'Board tidak ditemukan');
        }
        $board_data = List_boardModel::with(['cards' => function($query) {
                    $query->orderBy('urutan', 'asc')
                    ->with('anggota_card_list.user', 'anggota_card_list.anggota_tim', 'label_card', 'kalender', 'title_checklist_card.checklist_card')
                    ->withCount('checklist_card')
                    ->withCount(['checklist_card as completed_checklist_count' => function ($query){
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
        // RECOMMENDATION: Add authorization check here.
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

        // RECOMMENDATION: Use a database transaction
        try {
            DB::transaction(function () use ($request, $user, $id_tim, $id_board) {
                $anggota_tim = $user->anggota_tim
                    ->where('id_tim_perusahaan', $id_tim)
                    ->firstOrFail(); // Use firstOrFail for better error handling

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
            });

            return back()->with('success', 'Berhasil Menambahkan Card');

        } catch (\Exception $e) {
            Log::error('Gagal menambahkan card: ' . $e->getMessage());
            return redirect()->back()->with('gagal', 'Gagal Menambahkan Card, silakan coba lagi.');
        }
    }

     // list store
    public function storeList (Request $request, $id, $id_board) {
        // RECOMMENDATION: Add authorization check here.
        $request->validate([
            'nama_list' => 'required|string|max:50',
            'id_board' => 'required|string|max:36|exists:board_tim,id',
        ]);

        try{
            $maxUrutan = List_boardModel::where('id_board', $request->id_board)->max('urutan_posisi');
            $urutan = $maxUrutan ? $maxUrutan + 1 : 1; // Simplified logic

            List_boardModel::create([
                'id' => (string) Str::uuid(),
                'urutan_posisi' => $urutan,
                'judul' => $request->nama_list,
                'id_board' => $request->id_board,
            ]);

            $this->broadcastBoardUpdate($id_board);

            return back()->with('success', 'Berhasil tambah list');
        }catch(\Exception $e){
            Log::error('Gagal menambahkan list: ' . $e->getMessage());
            return redirect()->back()->with('gagal', 'Gagal Menambahkan list, silakan coba lagi.');
        }
    }

    public function showCard($id, $id_tim,  $cardId ) {
        // RECOMMENDATION: Add authorization check here.
        $kalender = Kalender::where('id_card', $cardId)->first();
        $label_tim = Label_tim::where('id_tim_perusahaan', $id_tim)->get();
        $label_card = Label_card::where('id_card', $cardId)->get();
        $id_board = BoardModel::where('id_team', $id_tim)->value('id');
        $dataCard = Card_listModel::where('id', $cardId)->firstOrFail();
        $title_checklist = Title_Checklist::where('id_tim_perusahaan', $id_tim)->get();
        $deskripsi = Deskripsi::where('id_card', $cardId)->first();
        $checklist = Title_Checklist_card::with(['checklist_card' => function ($query) use ($cardId){
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
            'deskripsi' => $deskripsi,
        ]);
    }

    // ... The rest of the methods would follow a similar pattern of adding authorization checks, transactions, and improved error handling ...
    
    // CHECKLIST (Corrected from merge conflict)
    public function store_checklist(Request $request, $id, $id_tim, $id_card)
    {
        if($request->template_id){
            $request->validate([
                'template_id' => 'nullable|string|exists:title_checklist,id',
                'title' => 'nullable|string|max:255',
            ]);
        } else {
            $request->validate([
                'template_id' => 'nullable|string|exists:title_checklist,id',
                'title' => 'required_without:template_id|string|max:255',
            ]);
        }

        try {
            // RECOMMENDATION: Wrap this in a DB::transaction
            $newTitleCard = DB::transaction(function () use ($request, $id_tim, $id_card) {
                if ($request->template_id) {
                    $masterTitle = Title_Checklist::with('checklist')->findOrFail($request->template_id);
                    $newTitleCard = Title_Checklist_card::create([
                        'id' => (string) Str::uuid(),
                        'title' => $masterTitle->title,
                        'id_card' => $id_card,
                        'id_tim' => $id_tim,
                        'id_title_checklist' => $masterTitle->id,
                    ]);

                    $templateItems = $masterTitle->checklist;
                    if ($templateItems->isNotEmpty()) {
                        $itemsToInsert = $templateItems->map(function ($item) use ($id_card, $newTitleCard) {
                            return [
                                'id' => (string) Str::uuid(),
                                'title' => $item->title,
                                'id_card' => $id_card,
                                'is_checked' => false,
                                'id_title_checklist_card' => $newTitleCard->id,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ];
                        })->toArray();
                        Checklist_card::insert($itemsToInsert);
                    }
                } else {
                    // This creates a new master/template checklist
                    $masterTitle = Title_Checklist::create([
                        'id' => (string) Str::uuid(),
                        'title' => $request->title,
                        'id_tim_perusahaan' => $id_tim,
                    ]);

                    // This attaches the new checklist to the current card
                    $newTitleCard = Title_Checklist_card::create([
                        'id' => (string) Str::uuid(),
                        'title' => $masterTitle->title,
                        'id_card' => $id_card,
                        'id_tim' => $id_tim,
                        'id_title_checklist' => $masterTitle->id,
                    ]);
                }
                return $newTitleCard;
            });

            $id_board = BoardModel::where('id_team', $id_tim)->value('id');
            $this->broadcastBoardUpdate($id_board);

            return redirect()->back()
                ->with('success', 'Berhasil menambahkan checklist')
                ->with('new_checklist', $newTitleCard->id);

        } catch (ModelNotFoundException $e) {
            Log::error('Gagal menyimpan checklist: Template tidak ditemukan. ' . $e->getMessage());
            return redirect()->back()->with('gagal', 'Template checklist yang dipilih tidak valid.');
        } catch (\Exception $e) {
            Log::error('Gagal menyimpan checklist: ' . $e->getMessage());
            return redirect()->back()->with('gagal', 'Terjadi kesalahan saat menyimpan checklist.');
        }
    }

    // ... other methods ...

    // REMOVED `update_notchecklist` as it was a duplicate of `update_checklist`
    public function update_checklist (Request $request, $id, $checklist_id) {
        // RECOMMENDATION: Add authorization check here.
        $request->validate([
            'is_checked' => 'required|boolean',
        ]);
        
        try {
            $checklist = Checklist_card::findOrFail($checklist_id);
            $checklist->update([
                'is_checked' => $request->is_checked,
            ]);

            $id_board = $checklist->card->listBoard->id_board;
            $this->broadcastBoardUpdate($id_board);

            return response()->json(['success' => 'Checklist updated successfully']);
        } catch (\Exception $e) {
            Log::error('Gagal update checklist item: ' . $e->getMessage());
            return response()->json(['error' => 'Gagal memperbarui checklist'], 500);
        }
    }
    
    // ... all other methods from the original file would be included here ...

    // This is the private helper method, which is good practice.
    private function broadcastBoardUpdate ($id_board) {
        // Siarkan ke semua event client
        broadcast(new BoardUpdated($id_board));
    }

}