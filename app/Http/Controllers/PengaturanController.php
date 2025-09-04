<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use App\Models\Perusahaan;
use Exception;

class PengaturanController extends Controller
{
    /**
     * Menampilkan halaman pengaturan perusahaan.
     * Data diambil langsung dari tabel 'perusahaan'.
     */
    public function index($id)
    {
        // Otorisasi: Pastikan user yang login sesuai dengan ID di URL
        if (Auth::id() != $id) {
            abort(403, 'Unauthorized.');
        }

        $user = Auth::user();
        // Ambil data perusahaan milik user yang sedang login
        $perusahaan = $user->perusahaan;

        // Jika user belum memiliki data perusahaan, siapkan data default
        if (!$perusahaan) {
            $perusahaanData = [
                'id' => null,
                'nama_perusahaan' => 'Nama Perusahaan Anda',
                'deskripsi' => 'Deskripsi singkat perusahaan Anda.',
                // Gunakan accessor untuk mendapatkan URL logo default
                'logo_url' => (new Perusahaan)->logo_url,
            ];
        } else {
            // Jika data perusahaan ada, kirimkan ke frontend
            $perusahaanData = [
                'id' => $perusahaan->id,
                'nama_perusahaan' => $perusahaan->nama_perusahaan,
                'deskripsi' => $perusahaan->deskripsi,
                // Gunakan accessor 'logo_url' dari model Perusahaan
                'logo_url' => $perusahaan->logo_url,
            ];
        }

        return Inertia::render('pageDashboard/ContentPengaturan', [
            'activePage' => 'DashboardPengaturan',
            'perusahaanData' => $perusahaanData,
        ]);
    }

    /**
     * Memperbarui data perusahaan (nama, deskripsi, dan logo).
     */
    public function update(Request $request, $id)
    {
        // Otorisasi: Pastikan user yang login sesuai dengan ID di URL
        if (Auth::id() != $id) {
            abort(403, 'Unauthorized.');
        }

        $request->validate([
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            // Validasi untuk file logo
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        try {
            // Cari perusahaan berdasarkan user_id, atau buat instance baru jika belum ada
            $perusahaan = Perusahaan::firstOrNew(['user_id' => Auth::id()]);

            // Perbarui nama dan deskripsi
            $perusahaan->nama_perusahaan = $request->input('nama');
            $perusahaan->deskripsi = $request->input('deskripsi');

            // Cek apakah ada file logo yang di-upload
            if ($request->hasFile('logo')) {
                // Simpan path logo lama untuk dihapus nanti
                $oldLogoPath = $perusahaan->image;

                // Simpan logo baru di 'storage/app/public/company-logos'
                // Path yang disimpan di database adalah 'company-logos/namafile.jpg'
                $newLogoPath = $request->file('logo')->store('company-logos', 'public');
                $perusahaan->image = $newLogoPath;

                // Hapus logo lama jika ada
                if ($oldLogoPath && Storage::disk('public')->exists($oldLogoPath)) {
                    Storage::disk('public')->delete($oldLogoPath);
                }
            }

            // Simpan semua perubahan ke database
            $perusahaan->save();

            return Redirect::back()->with('success', 'Pengaturan perusahaan berhasil diperbarui.');

        } catch (Exception $e) {
            // Jika terjadi error, kembalikan dengan pesan error
            return Redirect::back()->with('error', 'Gagal memperbarui pengaturan: ' . $e->getMessage());
        }
    }
}
