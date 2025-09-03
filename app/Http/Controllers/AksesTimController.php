<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Anggota_perusahaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AksesTimController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // --- PERUBAHAN LOGIKA DIMULAI DI SINI ---
        // 1. Dapatkan informasi keanggotaan user yang sedang login secara langsung dari tabel.
        // Ini lebih andal daripada mengandalkan relasi $user->anggota.
        $anggotaInfo = Anggota_perusahaan::where('user_id', $user->id)->first();

        // Jika user tidak terdaftar di perusahaan manapun, kembalikan array kosong.
        // Kondisi ini akan terpenuhi jika tidak ada baris di `anggota_perusahaan` untuk user ini.
        if (!$anggotaInfo) {
            return Inertia::render('pageDashboard/ContentAksesTim', [
                'activePage' => 'DashboardAksesTim',
                'tim' => [],
            ]);
        }

        // 2. Dapatkan ID perusahaan dari user yang login
        $perusahaanId = $anggotaInfo->perusahaan_id;
        // --- AKHIR PERUBAHAN LOGIKA ---

        // 3. Cari semua anggota yang berada di perusahaan yang sama
        //    dan ambil data user yang berelasi menggunakan with('user')
        $tim = Anggota_perusahaan::where('perusahaan_id', $perusahaanId)
            // ->where('user_id', '!=', $user->id) // <-- Baris ini tetap dinonaktifkan agar Anda bisa melihat data Anda sendiri muncul untuk tes.
            ->with('user') // Eager Loading untuk efisiensi query
            ->get()
            // 4. Ubah struktur data agar sesuai dengan yang dibutuhkan frontend
            ->map(function ($anggota) {
                // Pastikan relasi user tidak null untuk menghindari error
                if ($anggota->user) {
                    return [
                        'id' => $anggota->user->id,
                        'name' => $anggota->user->name,
                        'email' => $anggota->user->email,
                        'role' => $anggota->role, // Ambil role dari tabel anggota_perusahaan
                    ];
                }
                return null;
            })
            ->filter(); // Hapus item yang null dari koleksi

        return Inertia::render('pageDashboard/ContentAksesTim', [
            'activePage' => 'DashboardAksesTim',
            'tim' => $tim,
        ]);
    }

    /**
     * Method untuk mengubah role seorang anggota tim.
     */
    public function updateRole(Request $request, $id, $userId)
    {
        // Validasi input
        $request->validate([
            'role' => 'required|string|in:Admin,Member',
        ]);

        // Cari data keanggotaan berdasarkan user_id
        $anggota = Anggota_perusahaan::where('user_id', $userId)->firstOrFail();

        // Pastikan role Super User tidak diubah
        if ($anggota->role === 'Super User') {
            return back()->withErrors(['error' => 'Role Super User tidak dapat diubah.']);
        }

        // Update role di database
        $anggota->role = $request->input('role');
        $anggota->save();

        // Redirect kembali.
        return back()->with('success', 'Role berhasil diperbarui.');
    }

    /**
     * Menghapus user dari tim dan tabel users.
     */
    public function destroy($id, $userId)
    {
        // Cari data keanggotaan user yang akan dihapus untuk memeriksa role
        $anggota = Anggota_perusahaan::where('user_id', $userId)->first();

        // Pencegahan: Jangan hapus user jika rolenya adalah 'Super User'
        if ($anggota && $anggota->role === 'Super User') {
            return back()->withErrors(['error' => 'User dengan role Super User tidak dapat diubah.']);
        }
        
        // Cari user yang akan dihapus berdasarkan ID dan hapus
        // Jika relasi database diatur dengan 'onDelete cascade',
        // record di 'anggota_perusahaan' akan otomatis terhapus.
        $userToDelete = User::findOrFail($userId);
        $userToDelete->delete();

        // Redirect kembali dengan pesan sukses
        return back()->with('success', 'Anggota tim berhasil dihapus.');
    }
}
