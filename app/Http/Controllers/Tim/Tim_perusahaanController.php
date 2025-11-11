<?php

namespace App\Http\Controllers\Tim;

use App\Http\Controllers\Controller;
use App\Models\timPerusahaan\Anggota_card;
use App\Models\timPerusahaan\Card_listModel;
use App\Models\timPerusahaan\List_boardModel;
use App\Models\timPerusahaan\TimPerusahaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage; 


class Tim_perusahaanController extends Controller
{
    public function store(Request $request)
{
    $request->validate([
        'nama_tim' => 'required|string|max:100',
        'deskripsi_tim' => 'nullable|string',
        'jenis_tim' => 'required|string|in:proyek,tim',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', 
    ]);

    $user = Auth::user();

    if (!$user->anggotaPerusahaan) {
        return response()->json(['error' => 'User tidak terkait dengan perusahaan.'], 403);
    }

    $imagePath = null;
    if ($request->hasFile('image')) {
        // Simpan file ke 'storage/app/public/timperusahaan'
        $imagePath = $request->file('image')->store('timperusahaan', 'public');
    }


    $tim = TimPerusahaan::create([
        'id' => (string) Str::uuid(),
        'nama_tim' => $request->nama_tim,
        'deskripsi_tim' => $request->deskripsi_tim,
        'jenis_tim' => $request->jenis_tim,
        'image' => $imagePath, 
        'perusahaan_id' => $user->anggotaPerusahaan?->perusahaan?->id,
        'user_id' => $user->id,
    ]);

    // Tambahkan user ke anggota tim
    $tim->anggota_tim_perusahaan()->create([
        'id' => (string) Str::uuid(),
        'id_users' => $user->id,
        'role_anggota' => 'Ketua tim',
        'id_tim_perusahaan' => $tim->id,
    ]);

    $board = $tim->board_tim()->create([
        'id' => (string) Str::uuid(),
        'id_team' => $tim->id,
    ]);

    List_boardModel::create([
        'id' => (string) Str::uuid(),
        'urutan_posisi' => 1,
        'judul' => 'Baru Dibuat',
        'id_board' => $board->id,
    ]);

    List_boardModel::create([
        'id' => (string) Str::uuid(),
        'urutan_posisi' => 2,
        'judul' => 'Proses Pengerjaan',
        'id_board' => $board->id,
    ]);

    List_boardModel::create([
        'id' => (string) Str::uuid(),
        'urutan_posisi' => 3,
        'judul' => 'Perlu Verifikasi',
        'id_board' => $board->id,
    ]);

    List_boardModel::create([
        'id' => (string) Str::uuid(),
        'urutan_posisi' => 4,
        'judul' => 'Selesai',
        'id_board' => $board->id,
    ]);
    return redirect()->back()->with('success', 'Tim berhasil dibuat.');
}

    public function update(Request $request, $id, $id_tim)
    {
        $request->validate([
            'nama_tim' => 'required|string|max:255',
            'deskripsi_tim' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', 
            '_delete_image' => 'nullable|boolean' 
        ]);

        $tim = TimPerusahaan::findOrFail($id_tim);


        $tim->nama_tim = $request->nama_tim;
        $tim->deskripsi_tim = $request->deskripsi_tim;

        if ($request->hasFile('image')) {
            if ($tim->image) {
                Storage::disk('public')->delete($tim->image);
            }
            $imagePath = $request->file('image')->store('timperusahaan', 'public');
            $tim->image = $imagePath;
        } 
        elseif ($request->input('_delete_image')) {
            if ($tim->image) {
                Storage::disk('public')->delete($tim->image);
            }
            $tim->image = null;
        }
        $tim->save();

        return redirect()->back()->with('success', 'Tim berhasil diperbarui.');
    }

    public function destroy($id, $id_tim)
    {
        $tim = TimPerusahaan::findOrFail($id_tim);

        if ($tim->image) {
            Storage::disk('public')->delete($tim->image);
        }

        $tim->delete();

        return redirect()->back()->with('success', 'Tim berhasil dihapus.');
    }
}