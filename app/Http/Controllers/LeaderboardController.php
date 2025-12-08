<?php

namespace App\Http\Controllers;

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

        $userIds = Anggota_perusahaan::where('perusahaan_id', $perusahaanId)
                                ->where('role', '!=', 'Super User')
                                ->pluck('user_id');
        
        $semuaUser = User::whereIn('id', $userIds)->get();
        
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
            $selesaiTerlambat = 0;
            $terlambatBelumSelesai = 0;

            foreach ($tugasUser as $tugas) {
                $isCompleted = $tugas->checklist_card_count > 0 && $tugas->completed_checklist_count === $tugas->checklist_card_count;
                
                $dueDate = optional($tugas->kalender)->due_date;
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

            if ($totalTugasRelevan > 0) {
                $skor = $tepatWaktu / $totalTugasRelevan;
                if ($skor > 0.9) { $ratingBintang = 5; }
                elseif ($skor > 0.75) { $ratingBintang = 4; }
                elseif ($skor > 0.5) { $ratingBintang = 3; }
                elseif ($skor > 0.25) { $ratingBintang = 2; }
                else { $ratingBintang = 1; }
            } else {
                 $ratingBintang = 0;
            }
            
             $leaderboardData[] = [
                'name' => $user->name,
                'tasks' => $tepatWaktu, 
                'rating_bintang' => $ratingBintang, 
                'poto_profile_user' => $user->poto_profile_user ? asset('storage/' . $user->poto_profile_user) : null,
            ];
        }

        $sortedLeaderboard = collect($leaderboardData)->sortByDesc('tasks')->values()->all();

        return Inertia::render('pageDashboard/ContentLeaderboard', [
            'activePage' => 'DashboardLeaderboard',
            'leaderboardData' => $sortedLeaderboard,
        ]);
    }
}