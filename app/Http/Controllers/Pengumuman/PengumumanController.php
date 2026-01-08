<?php

namespace App\Http\Controllers\Pengumuman;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;
use App\Models\TimPerusahaan\BoardModel;
use App\Models\TimPerusahaan\TimPerusahaan;
use App\Events\BoardUpdated;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PengumumanController extends Controller
{
    public function pengumuman($id, $id_tim)
    {
        $userId = Auth::id();

        $unreadIds = Pengumuman::where('id_tim', $id_tim)
            ->whereDoesntHave('read', function($q) use ($userId) {
                $q->where('id_user_read', $userId);
            })
            ->pluck('id');

        $readData = [];
        foreach ($unreadIds as $announcementId) {
            $readData[] = [
                'id' => (string) Str::uuid(),
                'id_pengumuman' => $announcementId,
                'id_user_read' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if (!empty($readData)) {
            DB::table('read_at_pengumuman')->insert($readData);
        }

        $tim = TimPerusahaan::with('board_tim')
            ->withUnread($userId)
            ->findOrFail($id_tim);

        $id_board = $tim->board_tim ? $tim->board_tim->id : BoardModel::where('id_team', $id_tim)->value('id');

        $listPengumuman = Pengumuman::where('id_tim', $id_tim)
            ->with('pembuat')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('pageProyek/Pengumuman', [
            'dashboardId' => $id,
            'activePage' => 'pengumumanPage',
            'tim' => $tim,
            'id_board' => $id_board,
            'listPengumuman' => $listPengumuman,
        ]);
    }

    public function store(Request $request, $id, $id_tim)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
        ]);

        Pengumuman::create([
            'id_tim' => $id_tim,
            'user_id' => Auth::id(),
            'judul' => $request->judul,
            'isi' => $request->isi,
        ]);

        $id_board = BoardModel::where('id_team', $id_tim)->value('id');

        if ($id_board) {
            broadcast(new BoardUpdated($id_board, 'announcement'));
        }

        return back()->with('success', 'Pengumuman berhasil dibuat!');
    }

    public function update(Request $request, $id, Pengumuman $pengumuman)
    {
        if (Auth::id() !== $pengumuman->user_id) {
            abort(403, 'ANDA TIDAK MEMILIKI AKSES.');
        }

        $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
        ]);

        $pengumuman->update($request->only('judul', 'isi'));

        return back()->with('success', 'Pengumuman berhasil diperbarui!');
    }

    public function destroy($id, Pengumuman $pengumuman)
    {
        if (Auth::id() !== $pengumuman->user_id) {
            abort(403, 'ANDA TIDAK MEMILIKI AKSES.');
        }

        $pengumuman->delete();

        return back()->with('success', 'Pengumuman berhasil dihapus!');
    }
}