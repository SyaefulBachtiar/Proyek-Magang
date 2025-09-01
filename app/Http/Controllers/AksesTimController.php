<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Perusahaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AksesTimController extends Controller
{
    public function index()
    {
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
        ]);
    }

    /**
     * Method untuk mengubah role seorang anggota tim.
     * Method ini sudah diperbaiki untuk mencari user secara manual.
     */
    public function updateRole(Request $request, $id, $userId)
    {
        // Cari user secara manual berdasarkan ID yang didapat dari URL.
        $user = User::findOrFail($userId);

        // Validasi input
        $request->validate([
            'role' => 'required|string|in:Admin,Member',
        ]);

        // Cari data perusahaan yang terhubung dengan user
        $perusahaan = Perusahaan::where('user_id', $user->id)->firstOrFail();

        // Pastikan role Super User tidak diubah
        if ($perusahaan->role === 'Super User') {
            return back()->withErrors(['error' => 'Role Super User tidak dapat diubah.']);
        }

        // Update role di database
        $perusahaan->role = $request->input('role');
        $perusahaan->save();

        // Redirect kembali. Inertia akan me-refresh data di frontend.
        return back()->with('success', 'Role berhasil diperbarui.');
    }

    /**
     * FUNGSI BARU: Menghapus user dari tim dan tabel users.
     */
    public function destroy($id, $userId)
    {
        // Cari user yang akan dihapus berdasarkan ID
        $userToDelete = User::findOrFail($userId);

        // Cari data perusahaan yang terhubung dengan user tersebut untuk memeriksa role
        $perusahaan = Perusahaan::where('user_id', $userToDelete->id)->first();

        // Pencegahan: Jangan hapus user jika rolenya adalah 'Super User'
        if ($perusahaan && $perusahaan->role === 'Super User') {
            return back()->withErrors(['error' => 'User dengan role Super User tidak dapat dihapus.']);
        }

        // Hapus user dari tabel users. Data terkait (seperti di tabel perusahaan) akan ikut terhapus jika relasi di database diatur dengan 'onDelete cascade'.
        $userToDelete->delete();

        // Redirect kembali dengan pesan sukses
        return back()->with('success', 'Anggota tim berhasil dihapus.');
    }
}