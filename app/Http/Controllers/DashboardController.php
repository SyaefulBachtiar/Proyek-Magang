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

       $id_anggota = $user->tim_perusahaan
        ->flatMap->anggota_tim_perusahaan
        ->pluck('id_tim_perusahaan');


        $id_board = BoardModel::whereIn('id_team', $id_anggota)->value('id');

        $perusahaan = optional($user->perusahaan)->nama_perusahaan;


        $data = $user->tim_perusahaan()->with('anggota_tim_perusahaan.user')->get();


        return Inertia::render('pageDashboard/ContentMainDashboard', [
            'activePage' => 'DashboardMain',
            'role' => $role,
            'data' => $data,
            'perusahaan' => $perusahaan,
            'id_board' => $id_board,

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
