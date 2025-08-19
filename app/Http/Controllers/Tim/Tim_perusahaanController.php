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
            'role_anggota' => 'Ketua tim',
            'id_tim_perusahaan' => $tim->id,
        ]);

        $board = $tim->board_tim()->create([
            'id' => (string) Str::uuid(),
            'id_team' => $tim->id,
        ]);

        // Default List & Card
        $defaultLists = [
            'Ngurek' => [
                ['nama_card' => 'Ngurek isuk', 'pembuat' => $user->name],
                ['nama_card' => 'Ngruek beurang', 'pembuat' => $user->name],
            ],
            'Eukeur' => [
                ['nama_card' => 'Ngurek sore', 'pembuat' => $user->name],
            ],
            'Anngeus' => [
                ['nama_card' => 'Ngurek peuting', 'pembuat' => $user->name],
            ]
        ];

        $posisiList = 1;

        foreach ($defaultLists as $judulList => $cards) {
            // Buat list_board
            $listBoard = List_boardModel::create([
                'id' => (string) Str::uuid(),
                'urutan_posisi' => $posisiList++,
                'judul' => $judulList,
                'id_board' => $board->id,
            ]);
            // Buat card_list untuk setiap list_board
            foreach ($cards as $index => $card) {
                $cardList = Card_listModel::create([
                    'id' => (string) Str::uuid(),
                    'nama_card' => $card['nama_card'],
                    'pembuat' => $card['pembuat'],
                    'image' => null, // default kosong
                    'id_list' => $listBoard->id,
                    'urutan' => $index + 1,
                ]);

                $anggotaTim = $tim->anggota_tim_perusahaan()
                ->where('id_users', $user->id)
                ->first();

                if ($anggotaTim) {
                    Anggota_card::create([
                        'id' => (string) Str::uuid(),
                        'id_user' => $user->id,
                        'id_card' => $cardList->id,
                        'id_anggota_tim' => $anggotaTim->id
                    ]);
                }
            }
        }

        return redirect()->back()->with('success', 'Tim berhasil dibuat.');
    }

    public function destroy($id, $id_tim)
    {
        $tim = TimPerusahaan::findOrFail($id_tim);
        $tim->delete();

        return redirect()->back()->with('success', 'Tim berhasil dihapus.');
    }
}
