<?php

namespace App\Http\Controllers\Komentar;

use App\Events\BoardUpdated;
use App\Http\Controllers\Controller;
use App\Models\timPerusahaan\Card_listModel;
use App\Models\TimPerusahaan\Komentar;
use App\Models\timPerusahaan\Lampiran;
use App\Models\timPerusahaan\Notifikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class KomenController extends Controller
{
    public function komentar (Request $request, $id, $id_card) {
        // dd($request->all());
        $request->validate([
            'mention' => 'nullable|string',
            'mention_id' => 'nullable|string',
            'komentar' => 'required|string'
        ]);

        if (Lampiran::find($request->mention_id)) {

            Komentar::create([
                'id' => (string) Str::uuid(),
                'mention' => $request->mention,
                'lampiran_id' => $request->mention_id,
                'komentar' => $request->komentar,
                'parent_id' => null,
                'id_user' => $id,
                'id_card' => $id_card
            ]);

            $card = Card_listModel::find($id_card);

            $id_board = $card->listBoard->id_board;

            broadcast(new BoardUpdated($id_board));

            return redirect()->back()->with('success', 'berhasil komentar ke lampiran ' . $request->mention);
        }elseif(Komentar::find($request->mention_id)){
            Komentar::create([
                'id' => (string) Str::uuid(),
                'mention' => $request->mention,
                'lampiran_id' => null,
                'komentar' => $request->komentar,
                'parent_id' => $request->mention_id,
                'id_user' => $id,
                'id_card' => $id_card
            ]);

            $card = Card_listModel::find($id_card);

            $id_board = $card->listBoard->id_board;

            broadcast(new BoardUpdated($id_board));

            return redirect()->back()->with('success', 'berhasil komentar ke lampiran ' . $request->mention);
        }else{
            Komentar::create([
                'id' => (string) Str::uuid(),
                'mention' => null,
                'lampiran_id' => null,
                'komentar' => $request->komentar,
                'parent_id' => null,
                'id_user' => $id,
                'id_card' => $id_card
            ]);
            $card = Card_listModel::find($id_card);

            $id_board = $card->listBoard->id_board;

            broadcast(new BoardUpdated($id_board));

            return redirect()->back()->with('success', 'berhasil komentar');
        }

    }

    public function edit_komentar (Request $request, $id, $id_card) {
        // dd($request->all());
        $request->validate([
            'edit_komentar' => 'nullable|string',
            'mention_id' => 'nullable|string',
            'komentar' => 'required|string'
        ]);

        $komentar = Komentar::find($request->edit_komentar);

        $komentar->update([
            'komentar' => $request->komentar
        ]);

        return redirect()->back()->with('success', 'Berhasil edit komentar');
    }

    public function delete_komentar ($id, $id_komentar) {
        $komentar = Komentar::find($id_komentar);

        $komentar->delete();

        return redirect()->back()->with('success', 'berhasil delete komentar');
    }
}
