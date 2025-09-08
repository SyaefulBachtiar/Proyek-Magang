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
                // Sediakan URL logo default/placeholder jika belum ada data perusahaan.
                // Avatar ini akan menampilkan huruf 'P' sebagai placeholder.
                'logo_url' => 'https://ui-avatars.com/api/?name=P&color=7F9CF5&background=EBF4FF',
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

            // Cek apakah ada file logo baru yang di-upload
            if ($request->hasFile('logo')) {
                // **LANGKAH 1: Simpan path logo lama sebelum diperbarui.**
                // Path ini akan digunakan untuk menemukan dan menghapus file lama dari storage.
                // Pastikan kolom 'image' di model Perusahaan Anda berisi path file.
                $oldLogoPath = $perusahaan->image;

                // **LANGKAH 2: Simpan logo baru.**
                // Simpan file logo baru di 'storage/app/public/company-logos'.
                // Path yang disimpan di database adalah 'company-logos/namafile.jpg'.
                $newLogoPath = $request->file('logo')->store('company-logos', 'public');
                $perusahaan->image = $newLogoPath;

                // **LANGKAH 3: Hapus logo lama jika ada.**
                // Cek apakah path logo lama ada (bukan null) DAN file tersebut benar-benar ada di dalam storage.
                if ($oldLogoPath && Storage::disk('public')->exists($oldLogoPath)) {
                    // Jika kedua kondisi terpenuhi, hapus file lama dari direktori.
                    Storage::disk('public')->delete($oldLogoPath);
                }
            }

            // Simpan semua perubahan (nama, deskripsi, dan path logo baru) ke database
            $perusahaan->save();

            return Redirect::back()->with('success', 'Pengaturan perusahaan berhasil diperbarui.');

        } catch (Exception $e) {
            // Jika terjadi error, kembalikan dengan pesan error
            return Redirect::back()->with('error', 'Gagal memperbarui pengaturan: ' . $e->getMessage());
        }
    }
}
