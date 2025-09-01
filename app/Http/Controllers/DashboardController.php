<?php

namespace App\Http\Controllers;

use App\Models\Perusahaan;
use App\Models\timPerusahaan\Anggota_tim;
use App\Models\timPerusahaan\BoardModel;
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

        $perusahaan = optional($user->perusahaan)->nama_perusahaan;

        $query = TimPerusahaan::with([
            'anggota_tim_perusahaan.user',
            'board_tim.listBoards',
            'perusahaan'
        ])->whereHas('perusahaan', function($q) use ($perusahaan){
            $q->where('nama_perusahaan', $perusahaan);
        });

        // filter sesuai role
    if (!in_array($role, ['Super User', 'Admin'])) {
        // kalau member → hanya tim yang dia bergabung
        $query->whereHas('anggota_tim_perusahaan', function ($q) {
            $q->where('id_users', Auth::id());
        });
    }

    $data = $query->get();

        return Inertia::render('pageDashboard/ContentMainDashboard', [
            'activePage' => 'DashboardMain',
            'role' => $role,
            'data' => $data,
            'perusahaan' => $perusahaan,
        ]);
    }

    public function update_perusahaan(Request $request, $id)
    {
        $request->validate([
            'nama_perusahaan' => 'required|string|max:255'
        ]);

        // Update di tabel users
        $user = User::findOrFail($id);

        // Update di tabel perusahaan (jika ada relasi)
        if ($user->perusahaan) {
            $user->perusahaan->update([
                'nama_perusahaan' => $request->nama_perusahaan
            ]);
        }

        return redirect()->back()->with('success', 'Nama perusahaan berhasil diperbarui');
    }
}
