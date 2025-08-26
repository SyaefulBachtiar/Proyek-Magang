<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage; 
use App\Models\Perusahaan;
use App\Models\ProfilePerusahaan;

class PengaturanController extends Controller
{
    /**
     * Menampilkan halaman pengaturan dengan data gabungan.
     */
    public function index($id)
    {
        // Cek otorisasi user
        if (Auth::id() != $id) {
            abort(403, 'Unauthorized.');
        }

        $user = Auth::user();
        $perusahaan = $user->perusahaan;

        // Siapkan data default untuk dikirim ke frontend
        $perusahaanData = [
            'id' => null,
            'nama_perusahaan' => 'Nama Perusahaan Anda',
            'deskripsi' => 'Deskripsi perusahaan Anda.',
            'logo_url' => asset('images/default-company-logo.png'), 
        ];

        if ($perusahaan) {
            // Pastikan profile perusahaan ada, jika tidak, buat baru.
            $profile = $perusahaan->profilePerusahaan()->firstOrCreate(
                ['perusahaan_id' => $perusahaan->id],
                ['role_perusahaan' => 'main']
            );

            // Gabungkan data dari kedua tabel
            $perusahaanData = [
                'id' => $perusahaan->id,
                'nama_perusahaan' => $perusahaan->nama_perusahaan,
                'deskripsi' => $profile->deskripsi,
                'logo_url' => $profile->logo_url, 
            ];
        }

        return Inertia::render('pageDashboard/ContentPengaturan', [
            'activePage' => 'DashboardPengaturan',
            'perusahaanData' => $perusahaanData,
        ]);
    }

    /**
     * Fungsi untuk mengupdate nama perusahaan, deskripsi, dan logo.
     */
    public function update(Request $request, $id)
    {
        // Cek otorisasi user
        if (Auth::id() != $id) {
            abort(403, 'Unauthorized.');
        }

        $request->validate([
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $user = Auth::user();
        $perusahaan = Perusahaan::where('user_id', $user->id)->firstOrFail();
        $profilePerusahaan = $perusahaan->profilePerusahaan()->firstOrFail();

        DB::beginTransaction();
        try {
            $perusahaan->nama_perusahaan = $request->input('nama');
            $perusahaan->save();

            $profilePerusahaan->deskripsi = $request->input('deskripsi');

            if ($request->hasFile('logo')) {
                $oldLogoPath = $profilePerusahaan->foto_profile_perusahaan;
                $newLogoPath = $request->file('logo')->store('company-logos', 'public');
                $profilePerusahaan->foto_profile_perusahaan = $newLogoPath;
                if ($oldLogoPath) {
                    Storage::disk('public')->delete($oldLogoPath);
                }
            }
            
            $profilePerusahaan->save();

            DB::commit();

            return Redirect::back()->with('success', 'Pengaturan perusahaan berhasil diperbarui.');

        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::back()->with('error', 'Gagal memperbarui pengaturan perusahaan: ' . $e->getMessage());
        }
    }
}
