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
    public function index($id)
    {
        if (Auth::id() != $id) {
            abort(403, 'Unauthorized.');
        }

        $user = Auth::user();
        $perusahaan = $user->perusahaan;
        if (!$perusahaan) {
            $perusahaanData = [
                'id' => null,
                'nama_perusahaan' => 'Nama Perusahaan Anda',
                'deskripsi' => 'Deskripsi singkat perusahaan Anda.',
                'logo_url' => 'https://ui-avatars.com/api/?name=P&color=7F9CF5&background=EBF4FF',
            ];
        } else {
            $perusahaanData = [
                'id' => $perusahaan->id,
                'nama_perusahaan' => $perusahaan->nama_perusahaan,
                'deskripsi' => $perusahaan->deskripsi,
                'logo_url' => $perusahaan->logo_url,
            ];
        }

        return Inertia::render('pageDashboard/ContentPengaturan', [
            'activePage' => 'DashboardPengaturan',
            'perusahaanData' => $perusahaanData,
        ]);
    }

    public function update(Request $request, $id)
    {
        if (Auth::id() != $id) {
            abort(403, 'Unauthorized.');
        }

        $request->validate([
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        try {
            $perusahaan = Perusahaan::firstOrNew(['user_id' => Auth::id()]);
            $perusahaan->nama_perusahaan = $request->input('nama');
            $perusahaan->deskripsi = $request->input('deskripsi');

            if ($request->hasFile('logo')) {
                $oldLogoPath = $perusahaan->image;

                $newLogoPath = $request->file('logo')->store('company-logos', 'public');
                $perusahaan->image = $newLogoPath;
                if ($oldLogoPath && Storage::disk('public')->exists($oldLogoPath)) {
                    Storage::disk('public')->delete($oldLogoPath);
                }
            }

            $perusahaan->save();

            return Redirect::back()->with('success', 'Pengaturan perusahaan berhasil diperbarui.');

        } catch (Exception $e) {
            return Redirect::back()->with('error', 'Gagal memperbarui pengaturan: ' . $e->getMessage());
        }
    }
}
