<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AksesTimController extends Controller
{
    public function index () {
        $user = Auth::user();

           $tim = User::join('perusahaan', 'users.id_perusahaan', '=', 'perusahaan.id')
                   ->where('users.id_perusahaan', $user->id_perusahaan)
                   ->select(
                       'users.id', 
                       'users.name', 
                       'users.email', 
                       'perusahaan.role' // Ambil kolom 'role' dari tabel 'perusahaan'
                    )
                   ->get();
        return Inertia::render('pageDashboard/ContentAksesTim', [
        'activePage' => 'DashboardAksesTim',
        'tim' => $tim,
        ]
    );
    }
}
