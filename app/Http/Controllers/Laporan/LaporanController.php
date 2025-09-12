<?php

namespace App\Http\Controllers\Laporan;

use App\Http\Controllers\Controller;
use App\Models\Anggota_perusahaan;
use App\Models\Perusahaan;
use App\Models\timPerusahaan\Anggota_tim;
use App\Models\timPerusahaan\Card_listModel;
use App\Models\timPerusahaan\List_boardModel;
use App\Models\timPerusahaan\TimPerusahaan;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaporanController extends Controller
{
    public function laporan ($id, $id_tim) {
        $tim = TimPerusahaan::findOrFail($id_tim);
        $id_board = $tim->board_tim->id;

        $anggota = Anggota_tim::with('user')
        ->where('id_tim_perusahaan', $id_tim)
        ->get()
        ->filter(fn($a) => $a->role_anggota !== 'Ketua tim');;

        // Memformat data agar sesuai dengan yang dibutuhkan frontend
        $formattedAnggota = $anggota->map(function ($item) {
            // Cek jika relasi user ada untuk menghindari error
            if ($item->user) {
                return [
                    'id' => $item->user->id, // Menggunakan ID user sebagai key unik
                    'name' => $item->user->name,
                    'role' => $item->role_anggota,
                ];
            }
            return null;
        })->filter()->values(); // Menghapus item null jika ada user yang tidak ditemukan
        // --- SELESAI KODE BARU ---

       // Ambil daftar ID user yang merupakan anggota tim (selain Ketua tim)
    $anggotaIds = $anggota->pluck('user.id')->toArray();

    $tugas = Card_listModel::whereHas('anggota_card_list', function ($query) use ($anggotaIds) {
        $query->whereIn('id_user', $anggotaIds);
    })->with('kalender', 'anggota_card_list.user') 
    ->withCount([
        'checklist_card',
        'checklist_card as completed_checklist_count' => function ($q) {
            $q->where('is_checked', true);
        }
    ])
    ->get();

    // --- LOGIKA PENGELOMPOKAN TUGAS ---
    $groupedTugas = $tugas->groupBy(function ($item) {
        // === PERUBAHAN DI SINI ===
        // Cek jika relasi kalender ada, tanggalnya sudah lewat, dan tugas belum selesai.
        // Ganti 'end_date' sesuai dengan nama kolom di tabel kalender Anda (misal: tanggal_selesai, due_date, dll)
        $jadwal = $item->kalender->first();

        if ($jadwal && $jadwal->due_date < now() && $item->completed_checklist_count < $item->checklist_card_count) {
            return 'terlambat';
        }

        // Jika jumlah checklist > 0 dan semuanya sudah selesai dicek
        if ($item->checklist_card_count > 0 && $item->completed_checklist_count === $item->checklist_card_count) {
            return 'selesai';
        }

        // Jika ada checklist yang sudah dicek tapi belum semua
        if ($item->completed_checklist_count > 0) {
            return 'progress';
        }

        // Jika belum ada checklist yang dicek sama sekali
        return 'start';
    });

    // --- MEMBUAT STRUKTUR DATA UNTUK TABS ---
    $tugasPerTab = [
        [
            'id' => 'start',
            'judul' => 'Belum Dikerjakan',
            'cards' => $groupedTugas->get('start', collect())->values(),
        ],
        [
            'id' => 'progress',
            'judul' => 'Sedang Dikerjakan',
            'cards' => $groupedTugas->get('progress', collect())->values(),
        ],
        [
            'id' => 'selesai',
            'judul' => 'Selesai',
            'cards' => $groupedTugas->get('selesai', collect())->values(),
        ],
        [
            'id' => 'terlambat',
            'judul' => 'Terlambat',
            'cards' => $groupedTugas->get('terlambat', collect())->values(),
        ],
    ];


        // Mengirim data tim dan anggota yang sudah diformat ke komponen Laporan.jsx
        return Inertia::render('pageProyek/Laporan', [
            'dashboardId' => $id,
            'activePage' => 'laporanPage',
            'tim' => $tim,
            'anggotaTim' => $formattedAnggota ,
            'tugasPerTabs' => $tugasPerTab
        ]);
    }
}
