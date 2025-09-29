<?php

namespace App\Http\Controllers;

use App\Models\timPerusahaan\Card_listModel;
use App\Models\timPerusahaan\TimPerusahaan;
use Inertia\Inertia;

class RingkasController extends Controller
{
    public function index($id, $id_tim)
    {
        $tim = TimPerusahaan::findOrFail($id_tim);

        // Buat query dasar untuk tugas yang terkait dengan tim
        $tugasQuery = Card_listModel::whereHas('listBoard.board', function ($query) use ($id_tim) {
            $query->where('id_team', $id_tim);
        });

        // 1. Ambil 5 tugas terbaru untuk ditampilkan di list
        $tugasTerbaru = $tugasQuery->clone() // Gunakan clone() agar query utama tidak terpengaruh
            ->select('id', 'nama_card', 'created_at')
            ->latest()
            ->limit(5)
            ->get();
        
        // 2. Hitung jumlah total semua tugas
        $jumlahTugas = $tugasQuery->count();

        return Inertia::render('pageProyek/Rinkas', [
            'dashboardId' => $id,
            'activePage' => 'ringkasPage',
            'tim' => $tim,
            'tugas' => $tugasTerbaru,
            'jumlahTugas' => $jumlahTugas, // <-- KIRIM JUMLAH TUGAS
        ]);
    }
}