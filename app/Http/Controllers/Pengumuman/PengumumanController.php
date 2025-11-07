<?php

namespace App\Http\Controllers\Pengumuman;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;
use App\Models\User;
use App\Models\timPerusahaan\TimPerusahaan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PengumumanController extends Controller
{
    /**
     * Menampilkan halaman pengumuman.
     */
    public function pengumuman($id, $id_tim)
    {
        $tim = TimPerusahaan::findOrFail($id_tim);
        $listPengumuman = Pengumuman::where('id_tim', $id_tim)
                                ->with('pembuat') 
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
     * Method untuk menyimpan pengumuman baru.
     */
    public function store(Request $request, $id, $id_tim)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
        ]);

        Pengumuman::create([
            'id_tim' => $id_tim,
            'user_id' => Auth::id(),
            'judul' => $request->judul,
            'isi' => $request->isi,
        ]);

        return back()->with('success', 'Pengumuman berhasil dibuat!');
    }

    /**
     * Method baru untuk mengupdate pengumuman.
     */
    public function update(Request $request, $id, Pengumuman $pengumuman)
    {
        if (Auth::id() !== $pengumuman->user_id) {
            abort(403, 'ANDA TIDAK MEMILIKI AKSES.');
        }

        $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
        ]);

        $pengumuman->update($request->only('judul', 'isi'));

        return back()->with('success', 'Pengumuman berhasil diperbarui!');
    }

    /**
     * Method baru untuk menghapus pengumuman.
     */
    public function destroy($id, Pengumuman $pengumuman)
    {
        if (Auth::id() !== $pengumuman->user_id) {
            abort(403, 'ANDA TIDAK MEMILIKI AKSES.');
        }

        $pengumuman->delete();

        return back()->with('success', 'Pengumuman berhasil dihapus!');
    }
}