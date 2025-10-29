<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\timPerusahaan\Lampiran;
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
use App\Models\TimPerusahaan\Komentar;
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
use Illuminate\Support\Facades\Storage;

class ProyekController extends Controller
{

    // kanban
    public function index($id, $id_tim, $id_board)
    {
        $tim = TimPerusahaan::findOrFail($id_tim);
        if (!$tim->board_tim) {
            abort(404, 'Board tidak ditemukan');
        }
        $board_data = List_boardModel::with(['cards' => function ($query) {
            $query->orderBy('urutan', 'asc')
                ->with('anggota_card_list.user', 'anggota_card_list.anggota_tim', 'label_card', 'kalender', 'title_checklist_card.checklist_card')
                ->withCount('checklist_card')
                ->withCount(['checklist_card as completed_checklist_count' => function ($query) {
                    $query->where('is_checked', true);
                }]);
        }])
            ->where('id_board', $id_board)
            ->orderBy('urutan_posisi', 'asc')
            ->get();

        $user = Auth::user();

        // Ambil role pengguna saat ini untuk tim yang sedang dibuka
        $currentUserRole = Anggota_tim::where('id_tim_perusahaan', $id_tim)
            ->where('id_users', $user->id)
            ->value('role_anggota');

        $nama_perusahaan = $user->anggotaPerusahaan?->perusahaan?->nama_perusahaan;

        return Inertia::render('pageProyek/Kanban', [
            'dashboardId' => $id,
            'id_tim' => $id_tim,
            'id_board' => $id_board,
            'activePage' => 'tugasPage',
            'tim' => $tim,
            'dataBoard' => $board_data,
            'currentUserRole' => $currentUserRole, // Kirim role ke frontend
        ]);
    }

    // card store
    public function storeCard(Request $request, $id, $id_tim, $id_board)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'user tidak terkait dengan perusahaan'], 403);
        }

        $request->validate([
            'nama_tugas' => 'required|string|max:50',
            'id_list' => 'required|string|max:36|exists:list_board,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        try {

            $anggota_tim = $user->anggota_tim
                ->where('id_tim_perusahaan', $id_tim)
                ->first();

            $maxUrutan = Card_listModel::where('id_list', $request->id_list)->max('urutan');
            $urutan = $maxUrutan ? $maxUrutan + 1 : 1;


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

            $ketuaTim = Anggota_tim::where('id_tim_perusahaan', $id_tim)
                ->where('role_anggota', 'Ketua tim')
                ->first();

            if ($ketuaTim && $ketuaTim->id_users != $user->id) {
                $card->anggota_card_list()->create([
                    'id' => (string) Str::uuid(),
                    'id_user' => $ketuaTim->id_users,
                    'id_card' => $card->id,
                    'id_anggota_tim' => $ketuaTim->id,
                ]);
            }

            $this->broadcastBoardUpdate($id_board);

            return back()->with('success', 'Berhasil Menambahkan Card');
        } catch (\Exception $e) {
            return redirect()->back()->with('gagal', 'Gagal Menambahkan Card: ' . $e);
        }
    }

    // list store
    public function storeList(Request $request, $id, $id_board)
    {

        $request->validate([
            'nama_list' => 'required|string|max:50',
            'id_board' => 'required|string|max:36|exists:board_tim,id',
        ]);

        try {
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
        } catch (\Exception $e) {
            return redirect()->back()->with('gagal', 'Gagal Menambahkan list: ' . $e);
        }
    }

    // menampilkan card
    public function showCard($id, $id_tim,  $cardId)
    {
        $userId = Auth::id();
        $isMember = Anggota_card::where('id_card', $cardId)
            ->where('id_user', $userId)
            ->exists();

        if (!$isMember) {
            abort(403, 'Anda tidak memiliki akses untuk melihat detail tugas ini.');
        }

        $kalender = Kalender::where('id_card', $cardId)->first();
        $label_tim = Label_tim::where('id_tim_perusahaan', $id_tim)->get();
        $label_card = Label_card::where('id_card', $cardId)->get();
        $id_board = BoardModel::where('id_team', $id_tim)->value('id');
        $dataCard = Card_listModel::where('id', $cardId)->firstOrFail();
        $title_checklist = Title_Checklist::where('id_tim_perusahaan', $id_tim)->get();
        $deskripsi = Deskripsi::where('id_card', $cardId)->first();
        $komentar = Card_listModel::with(['komentar' => function ($query) use ($cardId) {
            $query->where('id_card', $cardId)->orderBy('created_at', 'desc')->with('user', 'lampiran');
        }])->find($cardId);

        $data_komentar = $komentar->komentar->map(function ($data) {
            return [
                'id' => $data->id,
                'mention' => $data->mention,
                'parent_id' => $data->parent_id,
                'komentar' => $data->komentar,
                'user_id' => $data->user->id,
                'user_name' => $data->user->name,
                'judul_lampiran' => $data?->lampiran?->judul,
                'created_at' => $data->created_at,
                'updated_at' => $data->updated_at,
            ];
        });
        $checklist = Title_Checklist_card::with(['checklist_card' => function ($query) use ($cardId) {
            $query->where('id_card', $cardId);
        }])->where('id_card', $cardId)->get();

        $lampiran_card = Lampiran::where('id_card', $cardId)->orderBy('created_at', 'desc')->get();
        $anggota_tim_list = Anggota_tim::with('user')
            ->where('id_tim_perusahaan', $id_tim)
            ->get();

        // Memformat data agar sesuai dengan kebutuhan frontend.
        $formatedTim = $anggota_tim_list->map(function ($anggota) {
            if (!$anggota->user) {
                return null; 
            }
            return [
                'id' => $anggota->user->id,
                'name' => $anggota->user->name,
                'email' => $anggota->user->email,
                'role_anggota' => $anggota->role_anggota,
            ];
        })->filter(); 

        return inertia('Card/Card_kanban', [
            'id' => $id,
            'id_tim' => $id_tim,
            'card_id' => $cardId,
            'kalender' => $kalender,
            'label_tim' => $label_tim,
            'label_card' => $label_card,
            'id_board' => $id_board,
            'anggota_tim' => $formatedTim, // Mengirim data yang sudah benar
            'dataCard' => $dataCard,
            'title_checklist' => $title_checklist,
            'checklist' => $checklist,
            'deskripsi' => $deskripsi,
            'lampiran_card' => $lampiran_card,
            'komentar' => $data_komentar,
        ]);
    }
 
    // Fungsi tambah anggota card
    public function tambah_anggota_card(Request $request, $id, $id_user, $cardId)
    {
        try {
            $card = Card_listModel::findOrFail($cardId);
            $id_tim = $card->listBoard->board->id_team;

            $anggota_tim = Anggota_tim::where('id_users', $id_user)
                ->where('id_tim_perusahaan', $id_tim)
                ->first();

            if (!$anggota_tim) {
                return redirect()->back()->with('gagal', 'Gagal: Pengguna bukan anggota dari tim ini.');
            }

            $isExist = Anggota_card::where('id_user', $id_user)->where('id_card', $cardId)->exists();
            if ($isExist) {
                return redirect()->back()->with('gagal', 'Pengguna sudah terdaftar di card ini.');
            }

            Anggota_card::create([
                'id' => (string) Str::uuid(),
                'id_user' => $id_user,
                'id_card' => $cardId,
                'id_anggota_tim' => $anggota_tim->id 
            ]);

            $userYangMenambahkan = User::where('id', $id)->value('name');
            Notifikasi::create([
                'id' => (string) Str::uuid(),
                'user_id' => $id_user,
                'title' => 'Anda ditambahkan ke tugas baru',
                'message' => "Anda telah ditambahkan ke tugas '{$card->nama_card}' oleh {$userYangMenambahkan}."
            ]);

            broadcast(new NotifikasiEvent($id_user));
            $this->broadcastBoardUpdate($card->listBoard->id_board);

            return redirect()->back()->with('success', 'Berhasil Menambahkan Anggota');
        } catch (\Exception $e) {
            Log::error('Error adding member to card: ' . $e->getMessage());
            return redirect()->back()->with('gagal', 'Terjadi kesalahan saat menambahkan anggota.');
        }
    }

    // Delete anggota Card
    public function destroy_anggota_card($id, $id_user, $cardId)
    {
        try {
            $anggotaCard = Anggota_card::where('id_card', $cardId)
                ->where('id_user', $id_user);

            if ($anggotaCard->doesntExist()) {
                return back()->with('gagal', 'Anggota tidak ditemukan pada kartu ini.');
            }

            $anggotaCard->delete();

            $card = Card_listModel::findOrFail($cardId);
            $id_board = $card->listBoard->id_board;

            broadcast(new NotifikasiEvent($id_user));

            $this->broadcastBoardUpdate($id_board);

            return back()->with('success', 'Berhasil mengeluarkan anggota');
        } catch (\Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan server: ' . $e->getMessage()], 500);
        }
    }

    private function broadcastBoardUpdate($id_board)
    {
        broadcast(new BoardUpdated($id_board));
    }

    public function updateListOrder(Request $request, $id)
    {
        $request->validate([
            'id_board' => 'required|string|exists:board_tim,id',
            'id_tim' => 'required|string|exists:tim_perusahaan,id',
            'lists' => 'required|array',
            'lists.*.id' => 'required|string',
            'lists.*.urutan_posisi' => 'required|integer'
        ]);

        $anggota = Anggota_tim::where('id_tim_perusahaan', $request->id_tim)
            ->where('id_users', Auth::id())
            ->first();

        if (!$anggota || $anggota->role_anggota !== 'Ketua tim') {
            return response()->json(['message' => 'Hanya ketua tim yang dapat memindahkan list.'], 403);
        }

        foreach ($request->lists as $list) {
            List_boardModel::where('id', $list['id'])->update(['urutan_posisi' => $list['urutan_posisi']]);
        }

        $this->broadcastBoardUpdate($request->id_board);

        return redirect()->back()->with('success', 'List berhasil di pindahkan');
    }

    public function updateCardOrder(Request $request, $id)
    {
        $request->validate([
            'id_board' => 'required|string|exists:board_tim,id',
            'id_tim' => 'required|string|exists:tim_perusahaan,id',
            'cards' => 'required|array',
            'cards.*.id' => 'required|string',
            'cards.*.urutan' => 'required|integer',
            'cards.*.id_list' => 'required|string'
        ]);

        $anggota = Anggota_tim::where('id_tim_perusahaan', $request->id_tim)
            ->where('id_users', Auth::id())
            ->first();

        if ($anggota && $anggota->role_anggota === 'Member') {
            $listVerifikasiId = List_boardModel::where('id_board', $request->id_board)
                ->where('judul', 'Verifikasi Katim')->value('id');

            $listSelesaiId = List_boardModel::where('id_board', $request->id_board)
                ->where('judul', 'Anngeus')->value('id');

            foreach ($request->cards as $cardData) {
                $card = Card_listModel::find($cardData['id']);

                if ($card->id_list == $listVerifikasiId && $cardData['id_list'] != $listVerifikasiId) {
                    return response()->json(['message' => 'Anda tidak diizinkan memindahkan tugas dari list verifikasi.'], 403);
                }

                if ($card->id_list == $listSelesaiId) {
                    return response()->json(['message' => 'Anda tidak dapat memindahkan tugas yang sudah selesai.'], 403);
                }

                if ($cardData['id_list'] == $listSelesaiId) {
                    return response()->json(['message' => 'Hanya ketua tim yang dapat menyelesaikan tugas.'], 403);
                }
            }
        }

        foreach ($request->cards as $card) {
            Card_listModel::where('id', $card['id'])->update(['urutan' => $card['urutan'], 'id_list' => $card['id_list']]);
        }

        $this->broadcastBoardUpdate($request->id_board);

        return redirect()->back()->with('success', 'Card berhasil di pindahkan');
    }

    // Tambah Anggota Tim
    public function tambahAnggota(Request $request, $id, $id_tim)
    {
        $tim = TimPerusahaan::find($id_tim);
        if (!$tim) {
            return redirect()->back()->with('gagal', 'Tim perusahaan tidak ditemukan.');
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
                return redirect()->back()->with('gagal', 'Anggota sudah terdaftar di tim ini.');
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

            return redirect()->back()->with('success', 'User berhasil ditambahkan ke dalam tim.');

        } catch (\Exception $e) {
            return redirect()->back()->with('gagal', 'Terjadi kesalahan server: ' . $e->getMessage());
        }
    }

    // fungsi delet
    public function hapusAnggota($id, $id_tim, $id_user)
    {
        try {
            $anggota = Anggota_tim::where('id_tim_perusahaan', $id_tim)
                ->where('id_users', $id_user)
                ->first();

            if (!$anggota) {
                // Mengembalikan pesan gagal jika anggota tidak ditemukan
                return redirect()->back()->with('gagal', 'Anggota tidak ditemukan di tim ini.');
            }

            // Hapus anggota dari semua card terlebih dahulu
            Anggota_card::where('id_user', $anggota->id_users)->delete();

            // Hapus anggota dari tim
            $anggota->delete();

            broadcast(new NotifikasiEvent($id_user));

            // Mengembalikan redirect dengan flash message 'success'
            return redirect()->back()->with('success', 'Anggota tim berhasil dihapus.');

        } catch (\Exception $e) {
            // Mengembalikan redirect dengan flash message 'gagal' jika ada error
            return redirect()->back()->with('gagal', 'Terjadi kesalahan server: ' . $e->getMessage());
        }
    }

    public function kalender_store(Request $request, $id, $cardId)
    {

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

    public function kalender_update(Request $request, $id, $kalender_id)
    {
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

    public function kalender_delete($id, $kalender_id)
    {
        $kalender = Kalender::findOrFail($kalender_id);
        $id_board = $kalender->card->listBoard->id_board;
        $kalender->delete();
        $this->broadcastBoardUpdate($id_board);
        return back()->with('success', 'Berhasil hapus');
    }

    public function label_store(Request $request, $id, $id_card, $id_tim)
    {

        $request->validate([
            'title' => 'required|string',
            'warna' => 'required|string'
        ]);

        try {
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
        } catch (\Error $e) {
            return response()->json(['message' => 'Terjadi kesalahan server: ' . $e->getMessage()], 500);
        }
    }

    public function label_update(Request $request, $id, $id_tim, $id_label)
    {
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

    public function label_delete($id, $label_id)
    {
        $label = Label_tim::findOrFail($label_id);
        $id_tim = $label->id_tim_perusahaan;
        $label->delete();
        $id_board = BoardModel::where('id_team', $id_tim)->value('id');
        $this->broadcastBoardUpdate($id_board);
        return back()->with('success', 'Berhasil delete label');
    }

    public function label_card_store(Request $request, $id, $card_id)
    {

        $request->validate([
            'label_id' => 'required'
        ]);

        $label_tim = Label_tim::findOrFail($request->label_id);

        Label_card::create([
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

    public function label_card_delete($id, $card_id, $label_id)
    {
        $label_card = Label_card::where('id_card', $card_id)
            ->where('id_label_tim', $label_id)
            ->firstOrFail();

        $label_card->delete();
        $id_board = $label_card->card->listBoard->id_board;
        $this->broadcastBoardUpdate($id_board);
        return response()->json(['success' => 'Berhasil delete label']);
    }

    // CHECKLIST
    public function store_checklist(Request $request, $id, $id_tim, $id_card)
    {
        if ($request->template_id) {
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
            $newTitleCard = null;

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
                $itemsToInsert = [];

                if ($templateItems->isNotEmpty()) {
                    foreach ($templateItems as $item) {
                        $itemsToInsert[] = [
                            'id' => (string) Str::uuid(),
                            'title' => $item->title,
                            'id_card' => $id_card,
                            'is_checked' => false,
                            'id_title_checklist_card' => $newTitleCard->id,
                        ];
                    }
                    Checklist_card::insert($itemsToInsert);
                }
            } else {
                // 1. Buat master checklist baru
                $masterTitle = Title_Checklist::create([
                    'id' => (string) Str::uuid(),
                    'title' => $request->title,
                    'id_tim_perusahaan' => $id_tim,
                ]);

                $newTitleCard = Title_Checklist_card::create([
                    'id' => (string) Str::uuid(),
                    'title' => $masterTitle->title,
                    'id_card' => $id_card,
                    'id_tim' => $id_tim,
                    'id_title_checklist' => $masterTitle->id,
                ]);
            }

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

    public function store_item_checklist(Request $request, $id, $id_card)
    {

        $request->validate([
            'title_checklist_id' => 'required|string',
            'item_text' => 'required|string|max:255',
        ]);

        try {
            $checklist_title_card = Title_Checklist_card::findOrFail($request->title_checklist_id);
            $checklist_card = Checklist_card::create([
                'id' => (string) Str::uuid(),
                'title' => $request->item_text,
                'image' => null,
                'id_card' => $id_card,
                'is_checked' => false,
                'id_title_checklist_card' => $checklist_title_card->id,
            ]);

            Checklist::create([
                'id' => (string) Str::uuid(),
                'title' => $checklist_card->title,
                'image' => $checklist_card->image,
                'id_title_checklist' => $checklist_title_card->id_title_checklist,
            ]);

            $card = Card_listModel::findOrFail($id_card);
            $id_board = $card->listBoard->id_board;

            $this->broadcastBoardUpdate($id_board);

            return redirect()->back()->with('success', 'Berhasil Menambahkan Item Checklist');
        } catch (\Exception $e) {
            return redirect()->back()->with('gagal', 'Gagal Menambahkan Item Checklist: ' . $e);
        }
    }

    public function update_checklist(Request $request, $id, $checklist_id)
    {
        $request->validate([
            'is_checked' => 'required|boolean',
        ]);
        Log::info('Updating not-checklist_id: ' . $checklist_id);
        $checklist = Checklist_card::findOrFail($checklist_id);
        $checklist->update([
            'is_checked' => $request->is_checked,
        ]);

        $id_board = $checklist->card->listBoard->id_board;

        $this->broadcastBoardUpdate($id_board);

        return response()->json(['success' => 'Checklist updated success']);
    }

    public function update_notchecklist(Request $request, $id, $checklist_id)
    {
        $request->validate([
            'is_checked' => 'required|boolean',
        ]);

        $checklist = Checklist_card::findOrFail($checklist_id);
        $checklist->update([
            'is_checked' => $request->is_checked,
        ]);

        $id_board = $checklist->card->listBoard->id_board;

        $this->broadcastBoardUpdate($id_board);

        return response()->json(['success' => 'Checklist updated successfully']);
    }


    public function delete_title_checklist($id, $id_checklist)
    {
        $title_checklist = Title_Checklist_card::findOrFail($id_checklist);
        $title_checklist->delete();
        $id_board = $title_checklist->card->listBoard->id_board;
        $this->broadcastBoardUpdate($id_board);
        return redirect()->back()->with('success', 'Berhasil menghapus title checklist');
    }

    public function update_title_checklist(Request $request, $id, $id_checklist)
    {
        try {

            $request->validate([
                'id_checklist_card' => 'required|string|exists:checklist_card,id',
                'title_checklist' => 'required|string'
            ]);

            $checklist_card = Checklist_card::findOrFail($request->id_checklist_card);
            $title_checklist_card = $checklist_card->title_checklist_card;
            $checklist = Title_Checklist::with(['checklist' => function ($query) use ($checklist_card) {
                $query->where('title', $checklist_card->title);
            }])->find($title_checklist_card->id_title_checklist);

            // update checklist_card
            $checklist_card->update([
                'title' => $request->title_checklist
            ]);

            // update checklist kalau ada
            if ($checklist && $checklist->checklist->first()) {
                $checklist->checklist->first()->update([
                    'title' => $request->title_checklist
                ]);
            }

            return redirect()->back()->with('success', 'Berhasil Update');
        } catch (\Exception $e) {
            Log::info($e->getMessage());
            return redirect()->back()->with('error', 'Gagal edit title checklist');
        }
    }

    public function update_delete_checklist($id, $id_checklist)
    {
        $checklist_card = Checklist_card::findOrFail($id_checklist);

        if ($checklist_card) {
            $checklist_card->title_checklist_card->title_checklist->checklist()->delete();
        }

        $checklist_card->delete();
        return redirect()->back()->with('success', 'berhasil hapus');
    }

    public function delete_image_checklist($id, $checklist_id)
    {
        $checklist = Checklist_card::findOrFail($checklist_id);

        if ($checklist->image) {
            Storage::disk('public')->delete($checklist->image);
        }

        $checklist->update(['image' => null]);

        $id_board = $checklist->card->listBoard->id_board;

        $this->broadcastBoardUpdate($id_board);

        return redirect()->back()->with('success', 'Berhasil menghapus Image checklist');
    }

    public function upload_checklist_file(Request $request, $id, $checklist_id)
{
    $request->validate([
        // Ubah nama field dan aturan validasi untuk menerima tipe file baru
        'file' => 'required|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx,xls,xlsx,csv|max:5120', // Maks 5MB
    ]);

    $checklist = Checklist_card::findOrFail($checklist_id);

    if ($request->hasFile('file')) {
        // Hapus file lama jika ada
        if ($checklist->image) {
            Storage::disk('public')->delete($checklist->image);
        }

        // Simpan file baru di direktori yang lebih generik
        $filePath = $request->file('file')->store('checklist-files', 'public');
        $checklist->update(['image' => $filePath]);
    }

    $id_board = $checklist->card->listBoard->id_board;

    $this->broadcastBoardUpdate($id_board);

    return response()->json([
        'message' => 'File berhasil diupload',
        'file_url' => Storage::url($checklist->image) // Menggunakan Storage::url() untuk path yang benar
    ]);
}

    // update
    public function updateListTitle(Request $request, $id, $id_list)
    {
        $request->validate([
            'judul' => 'required|string|max:50',
        ]);

        try {
            $list = List_boardModel::findOrFail($id_list);
            $list->update([
                'judul' => $request->judul,
            ]);

            // Panggil broadcast agar update realtime di semua client
            $this->broadcastBoardUpdate($list->id_board);

            return back()->with('success', 'Judul list berhasil diperbarui.');
        } catch (\Exception $e) {
            return back()->with('gagal', 'Gagal memperbarui judul list: ' . $e->getMessage());
        }
    }


    // DESKRIPSI
    public function store_deskripsi(Request $request, $id, $id_card)
    {

        try {
            $request->validate([
                'deskripsi' => 'required|string',
                'id_deskripsi' => 'nullable|string|exists:deskripsi,id',
            ]);

            $deskripsi = Deskripsi::find($request->id_deskripsi);
            if (!$deskripsi) {
                Deskripsi::create([
                    'id' => (string) Str::uuid(),
                    'deskripsi' => $request->deskripsi,
                    'id_card' => $id_card
                ]);
            } else {

                $deskripsi->update([
                    'deskripsi' => $request->deskripsi
                ]);
            }

            $card = Card_listModel::findOrFail($id_card);

            $id_board = $card->listBoard->id_board;

            $this->broadcastBoardUpdate($id_board);

            return redirect()->back()->with('success', 'Berhasil menambahkan deskripsi');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'error: ' . $e);
        }
    }

    public function store_lampiran(Request $request, $id, $card_id)
    {
        $request->validate([
            'judul' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'gambar' => 'required|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx,xls,xlsx,txt|max:5120', // Maks 5MB, bisa berbagai jenis file
        ]);

        try {
            $card = Card_listModel::findOrFail($card_id);
            $path = $request->file('gambar')->store('lampiran', 'public');

            Lampiran::create([
                'id' => (string) Str::uuid(),
                'judul' => $request->judul,
                'deskripsi' => $request->deskripsi,
                'image' => $path, // Simpan path filenya
                'id_card' => $card_id,
            ]);

            $id_board = $card->listBoard->id_board;
            $this->broadcastBoardUpdate($id_board);

            return back()->with('success', 'Lampiran berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error('Gagal upload lampiran: ' . $e->getMessage());
            return back()->with('gagal', 'Gagal menambahkan lampiran.');
        }
    }

    public function update_lampiran(Request $request, $id, $lampiran_id)
    {
        $request->validate([
            'judul' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx,xls,xlsx,txt|max:5120',
            '_method' => 'required|string|in:PUT',
        ]);

        try {
            $lampiran = Lampiran::findOrFail($lampiran_id);

            $lampiran->judul = $request->judul;
            $lampiran->deskripsi = $request->deskripsi;

            if ($request->hasFile('image')) {
                Storage::disk('public')->delete($lampiran->image);
                $path = $request->file('image')->store('lampiran', 'public');
                $lampiran->image = $path;
            }

            $lampiran->save();

            $id_board = $lampiran->card->listBoard->id_board;
            $this->broadcastBoardUpdate($id_board);

            return back()->with('success', 'Lampiran berhasil diperbarui.');
        } catch (\Exception $e) {
            return back()->with('gagal', 'Gagal memperbarui lampiran.');
        }
    }

    public function destroy_lampiran($id, $lampiran_id)
    {
        try {
            $lampiran = Lampiran::findOrFail($lampiran_id);

            $id_board = $lampiran->card->listBoard->id_board;
            Storage::disk('public')->delete($lampiran->image);
            $lampiran->delete();
            $this->broadcastBoardUpdate($id_board);

            return back()->with('success', 'Lampiran berhasil dihapus.');
        } catch (\Exception $e) {
            return back()->with('gagal', 'Gagal menghapus lampiran.');
        }
    }


    public function destroyList(Request $request, $id, $id_list)
    {
        $request->validate([
            'id_tim' => 'required|string|exists:tim_perusahaan,id',
        ]);
        $anggota = Anggota_tim::where('id_tim_perusahaan', $request->id_tim)
            ->where('id_users', Auth::id())
            ->first();

        if (!$anggota || $anggota->role_anggota !== 'Ketua tim') {
            return redirect()->back()->with('gagal', 'Hanya ketua tim yang dapat menghapus list.');
        }

        try {
            $list = List_boardModel::findOrFail($id_list);

            $id_board = $list->id_board;

            $list->delete();

            $this->broadcastBoardUpdate($id_board);

            return redirect()->back()->with('success', 'List berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Gagal menghapus list: ' . $e->getMessage());
            return redirect()->back()->with('gagal', 'Terjadi kesalahan saat menghapus list.');
        }
    }

    // Arsip

    public function archiveCard($id, $cardId)
    {
        $card = Card_listModel::withoutGlobalScope('active')->findOrFail($cardId);
        $card->update(['archived_at' => Carbon::now()]);

        $this->broadcastBoardUpdate($card->listBoard->id_board);
        return back()->with('success', 'Tugas berhasil diarsipkan.');
    }

    public function destroyCard($id, $cardId)
    {
        $card = Card_listModel::withoutGlobalScope('active')->findOrFail($cardId);
        $id_board = $card->listBoard->id_board;

        $card->delete();

        $this->broadcastBoardUpdate($id_board);
        return back()->with('success', 'Tugas berhasil dihapus permanen.');
    }

    public function restoreCard($id, $cardId)
    {
        $card = Card_listModel::withoutGlobalScope('active')->findOrFail($cardId);
        $card->update(['archived_at' => null]);

        $this->broadcastBoardUpdate($card->listBoard->id_board);
        return back()->with('success', 'Tugas berhasil dikembalikan ke papan.');
    }


    public function showArchived($id, $id_tim)
    {
        $tim = TimPerusahaan::findOrFail($id_tim);
        $id_board = $tim->board_tim->id;


        $archivedCards = Card_listModel::archived()
            ->whereHas('listBoard', function ($query) use ($id_board) {
                $query->where('id_board', $id_board);
            })
            ->with('listBoard')
            ->orderBy('archived_at', 'desc')
            ->get();

        return Inertia::render('pageProyek/Arsip', [
            'dashboardId' => $id,
            'id_tim' => $id_tim,
            'tim' => $tim,
            'activePage' => 'arsipPage',
            'archivedCards' => $archivedCards
        ]);
    }
}