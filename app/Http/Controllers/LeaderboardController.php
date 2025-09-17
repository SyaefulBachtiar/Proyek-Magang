<?php

namespace App\Http\Controllers;

// Tambahkan model yang diperlukan
use App\Models\Anggota_perusahaan;
use App\Models\timPerusahaan\Card_listModel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class LeaderboardController extends Controller
{
    public function index()
    {
        $currentUser = Auth::user();
        $anggotaInfo = Anggota_perusahaan::where('user_id', $currentUser->id)->first();

        if (!$anggotaInfo) {
            return Inertia::render('pageDashboard/ContentLeaderboard', [
                'activePage' => 'DashboardLeaderboard',
                'leaderboardData' => [],
            ]);
        }
        
        $perusahaanId = $anggotaInfo->perusahaan_id;

        // 2. Dapatkan SEMUA user ID yang berada di perusahaan yang SAMA,
        //    DAN BUKAN seorang 'Super User'.
        $userIds = Anggota_perusahaan::where('perusahaan_id', $perusahaanId)
                                ->where('role', '!=', 'Super User') // <-- TAMBAHAN KONDISI DI SINI
                                ->pluck('user_id');
        
        // 3. Ambil data lengkap pengguna berdasarkan ID yang didapat dari perusahaan tersebut.
        $semuaUser = User::whereIn('id', $userIds)->get();
        
        // Sisa kode tidak berubah...
        $semuaTugas = Card_listModel::whereHas('anggota_card_list', function ($query) use ($userIds) {
            $query->whereIn('id_user', $userIds);
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

        $leaderboardData = [];
        foreach ($semuaUser as $user) {
            $tugasUser = $semuaTugas->filter(fn($tugas) => $tugas->anggota_card_list->contains('id_user', $user->id));
            
            $tepatWaktu = 0; 

            foreach ($tugasUser as $tugas) {
                $isCompleted = $tugas->checklist_card_count > 0 && $tugas->completed_checklist_count === $tugas->checklist_card_count;

                if ($isCompleted) {
                    $dueDate = optional($tugas->kalender->first())->due_date;
                    $completionDate = $tugas->checklist_card_max_updated_at;

                    if (!$dueDate || Carbon::parse($completionDate)->lessThanOrEqualTo(Carbon::parse($dueDate))) {
                        $tepatWaktu++;
                    }
                }
            }
            
             $leaderboardData[] = [
                'name' => $user->name,
                'tasks' => $tepatWaktu,
            ];
        }
        
        $sortedLeaderboard = collect($leaderboardData)->sortByDesc('tasks')->values()->all();

        return Inertia::render('pageDashboard/ContentLeaderboard', [
            'activePage' => 'DashboardLeaderboard',
            'leaderboardData' => $sortedLeaderboard,
        ]);
    }
}