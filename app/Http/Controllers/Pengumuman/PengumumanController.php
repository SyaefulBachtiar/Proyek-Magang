<?php

namespace App\Http\Controllers\Pengumuman;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;
use App\Models\User;
use App\Models\TimPerusahaan\TimPerusahaan; // Pastikan namespace sesuai Model (Capital T)
use App\Models\TimPerusahaan\BoardModel;    // Import BoardModel
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
        $userId = Auth::id(); // Ambil ID user login

        // UPDATE QUERY: Gunakan withUnread agar notifikasi muncul
        $tim = TimPerusahaan::with('board_tim')
            ->withUnread($userId)
            ->findOrFail($id_tim);
        
        // AMBIL ID BOARD: Diperlukan untuk real-time notifikasi di Navbar
        $id_board = $tim->board_tim ? $tim->board_tim->id : BoardModel::where('id_team', $id_tim)->value('id');

        $listPengumuman = Pengumuman::where('id_tim', $id_tim)
                                ->with('pembuat') 
                                ->orderBy('created_at', 'desc')
                                ->get();

        return Inertia::render('pageProyek/Pengumuman', [
            'dashboardId' => $id,
            'activePage' => 'pengumumanPage',
            'tim' => $tim,           // Data tim sekarang membawa unread_messages_count
            'id_board' => $id_board, // Data board dikirim untuk channel socket
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