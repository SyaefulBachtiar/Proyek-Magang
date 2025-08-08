<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AksesTimController extends Controller
{
    public function index () {
        $user = Auth::user();

          $tim = User::leftJoin('perusahaan', 'users.id', '=', 'perusahaan.user_id')
           ->where('perusahaan.nama_perusahaan', $user->perusahaan->nama_perusahaan)
           ->select(
               'users.id',
               'users.name',
               'users.email',
               'perusahaan.role'
           )
           ->get();
        return Inertia::render('pageDashboard/ContentAksesTim', [
        'activePage' => 'DashboardAksesTim',
        'tim' => $tim,
        ]
    );
    }
}
