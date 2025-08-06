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
        $user = User::with('tim_perusahaan')->findOrFail(Auth::id());
        $role = optional($user->perusahaan)->role;  

        $data = $user->tim_perusahaan()->with('anggota_tim_perusahaan.user')->get();


        return Inertia::render('pageDashboard/ContentMainDashboard', [
            'activePage' => 'DashboardMain',
            'role' => $role,
            'data' => $data,
        ]);
    }
}
