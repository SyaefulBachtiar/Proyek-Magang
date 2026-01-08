<?php

namespace App\Http\Controllers\Laporan;

use App\Http\Controllers\Controller;
use App\Models\TimPerusahaan\Anggota_tim;
use App\Models\TimPerusahaan\Card_listModel;
use App\Models\TimPerusahaan\TimPerusahaan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth; 

class LaporanController extends Controller
{
    public function laporan(Request $request, $id, $id_tim)
    {
        $userId = Auth::id(); 
        $tim = TimPerusahaan::with('board_tim')
            ->withUnread($userId)
            ->findOrFail($id_tim);

        $id_board = $tim->board_tim ? $tim->board_tim->id : null;

        $anggota = Anggota_tim::with('user')
            ->where('id_tim_perusahaan', $id_tim)
            ->get()
            ->filter(fn ($a) => $a->role_anggota !== 'Ketua tim');

        $anggotaIds = $anggota->pluck('user.id')->filter()->toArray();

        $querySemuaTugas = Card_listModel::whereHas('anggota_card_list', function ($query) use ($anggotaIds) {
            $query->whereIn('id_user', $anggotaIds);
        });

        if ($request->has('start_date') && $request->has('end_date')) {
            $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
            $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
            $querySemuaTugas->whereBetween('created_at', [$startDate, $endDate]);
        }
        
        $semuaTugas = $querySemuaTugas->with('kalender', 'anggota_card_list.user', 'listBoard')
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
                $isChecklistComplete = $tugas->checklist_card_count > 0 && $tugas->completed_checklist_count === $tugas->checklist_card_count;
                
                $dueDate = optional($tugas->kalender)->due_date;
                $completionDate = $tugas->checklist_card_max_updated_at;

                if ($isChecklistComplete) {
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

            $saranTeks = '';
            $saranIkon = 'Lightbulb';
            $saranWarna = 'indigo';

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
                default: 
                    $saranTeks = 'Selamat datang! Ambil tugas pertama Anda dan tunjukkan kontribusi terbaik untuk kemajuan tim.';
                    $saranIkon = 'Sparkles';
                    $saranWarna = 'sky';
                    break;
            }

            return [
                'id' => $item->user->id,
                'name' => $item->user->name,
                'poto_profile_user' => $item->user->poto_profile_user ? asset('storage/' . $item->user->poto_profile_user) : null,
                'role' => $item->role_anggota,
                'team' => $tim->nama_tim,
                'rating_bintang' => $ratingBintang,
                'rating_label' => $ratingLabel,
                'saran_teks' => $saranTeks,
                'saran_ikon' => $saranIkon,
                'saran_warna' => $saranWarna,
            ];
        })->filter()->values();

        $groupedTugas = $semuaTugas->groupBy(function ($item) {
            
            $isChecklistComplete = $item->checklist_card_count > 0 && $item->completed_checklist_count === $item->checklist_card_count;
            $isInDoneList = $item->listBoard && $item->listBoard->judul === 'Selesai';
            $completionDate = $item->checklist_card_max_updated_at;
            $dueDate = optional($item->kalender)->due_date;

            $isFinishedLate = $isChecklistComplete && $dueDate && Carbon::parse($completionDate)->isAfter(Carbon::parse($dueDate));
            $isCurrentlyLate = !$isChecklistComplete && $dueDate && Carbon::parse($dueDate)->isPast();

            if ($isInDoneList) {
                if ($isFinishedLate) {
                    return 'terlambat'; 
                } else {
                    return 'selesai'; 
                }
            } else {
                if ($isCurrentlyLate) {
                    return 'terlambat'; 
                }
                
                if ($item->completed_checklist_count > 0) {
                    return 'progress';
                }
                
                return 'start';
            }
        });

        $tugasPerTab = [
            ['id' => 'start', 'judul' => 'Belum Dikerjakan', 'cards' => $groupedTugas->get('start', collect())->values()],
            ['id' => 'progress', 'judul' => 'Sedang Dikerjakan', 'cards' => $groupedTugas->get('progress', collect())->values()],
            ['id' => 'selesai', 'judul' => 'Selesai', 'cards' => $groupedTugas->get('selesai', collect())->values()],
            ['id' => 'terlambat', 'judul' => 'Terlambat', 'cards' => $groupedTugas->get('terlambat', collect())->values()],
        ];

        $stagnantThresholdDays = 7;
        $overdueThresholdDays = 3;

        $tugasMengendap = $semuaTugas->filter(function ($tugas) use ($stagnantThresholdDays) {
            $isInDoneList = $tugas->listBoard && $tugas->listBoard->judul === 'Selesai';
            $isTaskCompleted = $isInDoneList; 
            
            return !$isTaskCompleted && Carbon::parse($tugas->updated_at)->lessThan(now()->subDays($stagnantThresholdDays));
        });

        $terlambatKritis = $semuaTugas->filter(function ($tugas) use ($overdueThresholdDays) {
            $isInDoneList = $tugas->listBoard && $tugas->listBoard->judul === 'Selesai';
            $isTaskCompleted = $isInDoneList; 

            $dueDate = optional($tugas->kalender)->due_date;
            return !$isTaskCompleted && $dueDate && Carbon::parse($dueDate)->lessThan(now()->subDays($overdueThresholdDays));
        });

        $dataPenghambat = [
            'mengendap' => [
                'jumlah' => $tugasMengendap->count(),
                'threshold_hari' => $stagnantThresholdDays,
                'tugas_terlama' => $tugasMengendap->sortBy('updated_at')->first(),
            ],
            'terlambat_kritis' => [
                'jumlah' => $terlambatKritis->count(),
                'threshold_hari' => $overdueThresholdDays,
                'tugas_paling_terlambat' => $terlambatKritis->sortBy('kalender.due_date')->first(),
            ]
        ];

        return Inertia::render('pageProyek/Laporan', [
            'dashboardId' => $id,
            'activePage' => 'laporanPage',
            'tim' => $tim, 
            'anggotaTim' => $formattedAnggota,
            'tugasPerTabs' => $tugasPerTab,
            'id_board' => $id_board, 
            'penghambat' => $dataPenghambat,
        ]);
    }
}