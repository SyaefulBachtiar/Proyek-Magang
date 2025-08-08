<?php

namespace App\Http\Controllers\Tim;

use App\Http\Controllers\Controller;
use App\Models\timPerusahaan\TimPerusahaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;


class Tim_perusahaanController extends Controller
{
    public function store (Request $request) {
        $request->validate([
            'nama_tim' => 'required|string|max:100',
            'deskripsi_tim' => 'nullable|string',
            'jenis_tim' => 'required|string|in:proyek,tim',
        ]);

        $user = Auth::user();

        // Pastikan user memiliki relasi ke perusahaan
        if (!$user->perusahaan) {
            return response()->json(['error' => 'User tidak terkait dengan perusahaan.'], 403);
        }

        $tim = TimPerusahaan::create([
            'id' => (string) Str::uuid(),
            'nama_tim' => $request->nama_tim,
            'deskripsi_tim' => $request->deskripsi_tim,
            'jenis_tim' => $request->jenis_tim,
            'perusahaan_id' => $user->perusahaan->id,
            'user_id' => $user->id,
        ]);

        // Tambahkan user ke anggota tim
        $tim->anggota_tim_perusahaan()->create([
            'id' => (string) Str::uuid(),
            'id_users' => $user->id,
            'id_tim_perusahaan' => $tim->id,
        ]);

        $tim->board_tim()->create([
            'id' => (string) Str::uuid(),
            'id_team' => $tim->id,
        ]);

        return redirect()->back()->with('success', 'Tim berhasil dibuat.');
    }

    public function destroy($id, $id_tim)
    {
        $tim = TimPerusahaan::findOrFail($id_tim);
        $tim->delete();

        return redirect()->back()->with('success', 'Tim berhasil dihapus.');
    }
}
