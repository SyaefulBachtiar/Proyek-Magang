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
    })
    ->with('kalender', 'anggota_card_list.user')
    ->withMax('checklist_card', 'updated_at')
    ->withCount([
        'checklist_card',
        'checklist_card as completed_checklist_count' => function ($q) {
            $q->where('is_checked', true);
        }
    ])
    ->get();

    // --- LOGIKA PENGELOMPOKAN TUGAS (UPDATED) ---
    $groupedTugas = $tugas->groupBy(function ($item) {
        $jadwal = $item->kalender->first();
        $isTaskCompleted = $item->checklist_card_count > 0 && $item->completed_checklist_count === $item->checklist_card_count;
        $isOverdue = $jadwal && $jadwal->due_date < now();

        // 1. SELESAI TAPI TERLAMBAT - Prioritas tertinggi
        // Tugas selesai tetapi melewati deadline
        if ($isTaskCompleted && $isOverdue) {
            return 'terlambat';
        }

        // 2. TERLAMBAT - Belum selesai dan sudah melewati deadline
        // if ($isOverdue && !$isTaskCompleted) {
        //     return 'terlambat';
        // }

        // 3. SELESAI - Selesai tepat waktu atau belum ada deadline
        if ($isTaskCompleted) {
            return 'selesai';
        }

        // 4. PROGRESS - Ada checklist yang sudah dikerjakan tapi belum semua selesai
        if ($item->completed_checklist_count > 0 && $item->completed_checklist_count < $item->checklist_card_count) {
            return 'progress';
        }

        // 5. START - Belum ada checklist yang dikerjakan sama sekali
        return 'start';
    });

    // --- MEMBUAT STRUKTUR DATA UNTUK TABS (UPDATED) ---
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
            'tugasPerTabs' => $tugasPerTab,
            'id_board' => $id_board
        ]);
    }
}