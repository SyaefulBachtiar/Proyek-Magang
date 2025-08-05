<?php

namespace App\Http\Controllers;

use App\Models\timPerusahaan\Anggota_tim;
use App\Models\timPerusahaan\TimPerusahaan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index ($id) {
        if (Auth::id() != $id) {
        abort(403, 'Unauthorized.');
    }
    // ambil role user
        $user = Auth::user();
        $role = optional($user->perusahaan)->role;
        $idTimPerusahaan = $user->tim_perusahaan->pluck('id')->toArray();

        
        $anggotaTim_id_users = Anggota_tim::whereIn('id_tim_perusahaan', $idTimPerusahaan)
            ->pluck('id_users')
            ->toArray();
        
        $anggotaTim = User::whereIn('id', $anggotaTim_id_users)
            ->pluck('name')
            ->toArray();

        $data = $user->tim_perusahaan->toArray();

        return Inertia::render('pageDashboard/ContentMainDashboard', [
            'activePage' => 'DashboardMain',
            'role' => $role,
            'data' => $data,
            'anggotaTim' => $anggotaTim,
        ]);
    }
}
