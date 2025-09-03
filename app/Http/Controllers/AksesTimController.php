<?php

namespace App\Http\Controllers;

use App\Models\User;
// Ganti model Perusahaan dengan Anggota_perusahaan
use App\Models\Anggota_perusahaan; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AksesTimController extends Controller
{
    public function index()
    {
        $currentUser = Auth::user();

        $anggotaInfo = Anggota_perusahaan::where('user_id', $currentUser->id)->firstOrFail();
        $perusahaanId = $anggotaInfo->perusahaan_id;

        $semuaAnggota = Anggota_perusahaan::where('perusahaan_id', $perusahaanId)
            ->with('user')
            ->get();

        // 3. Ubah (map) data ke format yang dibutuhkan oleh frontend
        $tim = $semuaAnggota->map(function ($anggota) {
            return [
                'id'    => $anggota->user->id,       
                'name'  => $anggota->user->name,     
                'email' => $anggota->user->email,   
                'role'  => $anggota->role,           
            ];
        });
            
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

        // Cari data keanggotaan berdasarkan user_id yang akan diubah
        $anggota = Anggota_perusahaan::where('user_id', $userId)->firstOrFail();

        // Pastikan role Super User tidak diubah
        if ($anggota->role === 'Super User') {
            return back()->withErrors(['error' => 'Role Super User tidak dapat diubah.']);
        }

        // Update role di database
        $anggota->role = $request->input('role');
        $anggota->save();

        return back()->with('success', 'Role berhasil diperbarui.');
    }

    /**
     * Menghapus user dari tim dan tabel users.
     */
    public function destroy($id, $userId)
    {
        // Cari data keanggotaan untuk memeriksa role
        $anggota = Anggota_perusahaan::where('user_id', $userId)->first();

        // Pencegahan: Jangan hapus user jika rolenya adalah 'Super User'
        if ($anggota && $anggota->role === 'Super User') {
            return back()->withErrors(['error' => 'User dengan role Super User tidak dapat dihapus.']);
        }
        
        // Cari user yang akan dihapus berdasarkan ID
        $userToDelete = User::findOrFail($userId);

        $userToDelete->delete();

        return back()->with('success', 'Anggota tim berhasil dihapus.');
    }
}