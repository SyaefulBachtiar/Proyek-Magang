<?php

namespace App\Http\Controllers\Laporan;

use App\Http\Controllers\Controller;
use App\Models\timPerusahaan\Anggota_tim;
use App\Models\timPerusahaan\Card_listModel;
use App\Models\timPerusahaan\TimPerusahaan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class LaporanController extends Controller
{
    public function laporan($id, $id_tim)
    {
        $tim = TimPerusahaan::findOrFail($id_tim);
        $id_board = optional($tim->board_tim)->id;

        $anggota = Anggota_tim::with('user')
            ->where('id_tim_perusahaan', $id_tim)
            ->get()
            ->filter(fn ($a) => $a->role_anggota !== 'Ketua tim');

        $anggotaIds = $anggota->pluck('user.id')->filter()->toArray();

        $semuaTugas = Card_listModel::whereHas('anggota_card_list', function ($query) use ($anggotaIds) {
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

        $formattedAnggota = $anggota->map(function ($item) use ($semuaTugas, $tim) {
            if (!$item->user) {
                return null;
            }

            $tugasUser = $semuaTugas->filter(function ($tugas) use ($item) {
                return $tugas->anggota_card_list->contains('id_user', $item->user->id);
            });

            $tepatWaktu = 0;
            $selesaiTerlambat = 0;
            $terlambatBelumSelesai = 0;

            foreach ($tugasUser as $tugas) {
                $isCompleted = $tugas->checklist_card_count > 0 && $tugas->completed_checklist_count === $tugas->checklist_card_count;
                $dueDate = optional($tugas->kalender->first())->due_date;
                $completionDate = $tugas->checklist_card_max_updated_at;

                if ($isCompleted) {
                    if (!$dueDate || Carbon::parse($completionDate)->lessThanOrEqualTo(Carbon::parse($dueDate))) {
                        $tepatWaktu++;
                    } else {
                        $selesaiTerlambat++;
                    }
                } else {
                    if ($dueDate && Carbon::parse($dueDate)->isPast()) {
                        $terlambatBelumSelesai++;
                    }
                }
            }

            $totalTugasRelevan = $tepatWaktu + $selesaiTerlambat + $terlambatBelumSelesai;
            $ratingBintang = 3;
            $ratingLabel = 'Cukup';

            if ($totalTugasRelevan > 0) {
                $skor = $tepatWaktu / $totalTugasRelevan;
                if ($skor > 0.9) { $ratingBintang = 5; $ratingLabel = 'Sangat Bagus'; }
                elseif ($skor > 0.75) { $ratingBintang = 4; $ratingLabel = 'Bagus'; }
                elseif ($skor > 0.5) { $ratingBintang = 3; $ratingLabel = 'Cukup'; }
                elseif ($skor > 0.25) { $ratingBintang = 2; $ratingLabel = 'Kurang'; }
                else { $ratingBintang = 1; $ratingLabel = 'Buruk'; }
            } else {
                 $ratingBintang = 0;
                 $ratingLabel = 'Belum Ada Data';
            }

            // --- AWAL LOGIKA SARAN DINAMIS ---
            $saranTeks = '';
            $saranIkon = 'Lightbulb'; // Ikon default
            $saranWarna = 'indigo'; // Warna default

            switch ($ratingBintang) {
                case 5:
                    $saranTeks = 'Luar biasa! Kinerja Anda sangat konsisten dan efisien. Terus pertahankan momentum positif ini dan jadilah inspirasi bagi tim.';
                    $saranIkon = 'Rocket';
                    $saranWarna = 'green';
                    break;
                case 4:
                    $saranTeks = 'Kerja yang sangat baik! Anda berada di jalur yang tepat. Tetap fokus pada detail kecil untuk mencapai hasil yang lebih sempurna.';
                    $saranIkon = 'ThumbsUp';
                    $saranWarna = 'green';
                    break;
                case 3:
                    $saranTeks = 'Percepat penyelesaian tugas yang sedang dikerjakan, atau mulai kerjakan tugas baru untuk menjaga produktivitas.';
                    $saranIkon = 'Lightbulb';
                    $saranWarna = 'indigo';
                    break;
                case 2:
                    $saranTeks = 'Ada beberapa tugas yang terlambat. Mari identifikasi penghambatnya dan fokus selesaikan tugas satu per satu untuk kembali ke jalur.';
                    $saranIkon = 'Wrench';
                    $saranWarna = 'amber';
                    break;
                case 1:
                    $saranTeks = 'Banyak tugas melewati tenggat. Ini prioritas utama untuk diperbaiki. Jangan ragu meminta bantuan tim untuk merencanakan ulang beban kerja.';
                    $saranIkon = 'ShieldAlert';
                    $saranWarna = 'red';
                    break;
                default: // case 0
                    $saranTeks = 'Selamat datang! Ambil tugas pertama Anda dan tunjukkan kontribusi terbaik untuk kemajuan tim.';
                    $saranIkon = 'Sparkles';
                    $saranWarna = 'sky';
                    break;
            }
            // --- AKHIR LOGIKA SARAN DINAMIS ---

            return [
                'id' => $item->user->id,
                'name' => $item->user->name,
                'role' => $item->role_anggota,
                'team' => $tim->nama_tim,
                'rating_bintang' => $ratingBintang,
                'rating_label' => $ratingLabel,
                // Tambahkan data saran ke response
                'saran_teks' => $saranTeks,
                'saran_ikon' => $saranIkon,
                'saran_warna' => $saranWarna,
            ];
        })->filter()->values();

        // ... (sisa kode untuk $groupedTugas dan $tugasPerTab tetap sama) ...
        $groupedTugas = $semuaTugas->groupBy(function ($item) {
            $jadwal = $item->kalender->first();
            $isTaskCompleted = $item->checklist_card_count > 0 && $item->completed_checklist_count === $item->checklist_card_count;
            $completionDate = $item->checklist_card_max_updated_at;
            $isOverdue = $jadwal && $jadwal->due_date < ($isTaskCompleted ? $completionDate : now());

            if ($isTaskCompleted && $isOverdue) { return 'terlambat'; }
            if ($isTaskCompleted) { return 'selesai'; }
            if ($item->completed_checklist_count > 0) { return 'progress'; }
            if (!$isTaskCompleted && $jadwal && $jadwal->due_date < now()) { return 'terlambat'; }
            return 'start';
        });

        $tugasPerTab = [
            ['id' => 'start', 'judul' => 'Belum Dikerjakan', 'cards' => $groupedTugas->get('start', collect())->values()],
            ['id' => 'progress', 'judul' => 'Sedang Dikerjakan', 'cards' => $groupedTugas->get('progress', collect())->values()],
            ['id' => 'selesai', 'judul' => 'Selesai', 'cards' => $groupedTugas->get('selesai', collect())->values()],
            ['id' => 'terlambat', 'judul' => 'Terlambat', 'cards' => $groupedTugas->get('terlambat', collect())->values()],
        ];


        return Inertia::render('pageProyek/Laporan', [
            'dashboardId' => $id,
            'activePage' => 'laporanPage',
            'tim' => $tim,
            'anggotaTim' => $formattedAnggota,
            'tugasPerTabs' => $tugasPerTab,
            'id_board' => $id_board
        ]);
    }
}