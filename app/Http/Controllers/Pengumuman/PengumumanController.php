<?php

namespace App\Http\Controllers\Pengumuman;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;
use App\Models\User;
use App\Models\timPerusahaan\TimPerusahaan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth; // Pastikan ini ada


class PengumumanController extends Controller
{
    /**
     * Menampilkan halaman pengumuman.
     */
    public function pengumuman($id, $id_tim)
    {
        $tim = TimPerusahaan::findOrFail($id_tim);
        $listPengumuman = Pengumuman::where('id_tim', $id_tim)
                                ->with('pembuat') // Eager load relasi 'pembuat'
                                ->orderBy('created_at', 'desc')
                                ->get();

        return Inertia::render('pageProyek/Pengumuman', [
            'dashboardId' => $id,
            'activePage' => 'pengumumanPage',
            'tim' => $tim,
            'listPengumuman' => $listPengumuman,
        ]);
    }

    /**
     * Method baru untuk menyimpan pengumuman.
     */
    public function store(Request $request, $id, $id_tim)
    {
        // 1. Validasi input dari form
        $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
        ]);

        // 2. Buat dan simpan data pengumuman baru
        Pengumuman::create([
            'id_tim' => $id_tim,
            'user_id' => Auth::id(), // Ambil ID user yang sedang login
            'judul' => $request->judul,
            'isi' => $request->isi,
        ]);

        // 3. Redirect kembali ke halaman pengumuman dengan pesan sukses
        return redirect()->route('proyek.pengumuman', ['id' => $id, 'id_tim' => $id_tim])->with('success', 'Pengumuman berhasil dibuat!');
    }
}