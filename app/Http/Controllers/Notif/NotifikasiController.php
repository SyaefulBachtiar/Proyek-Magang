<?php

namespace App\Http\Controllers\Notif;

use App\Events\NotifikasiEvent;
use App\Http\Controllers\Controller;
use App\Models\TimPerusahaan\Notifikasi;
use Doctrine\DBAL\ArrayParameters\Exception;
use Illuminate\Http\Request;


class NotifikasiController extends Controller
{
    public function mark_read (Request $request, $id, $notif_id) {

        $user = $request->user();
        if(!$user){
             return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        try{
            $notifikasi = Notifikasi::where('id', $notif_id)->where('user_id', $user->id)->first();

            if($notifikasi){
                $notifikasi->is_read = true;
                $notifikasi->save();

                $this->broadcastUpdate($user->id);

                return back()->with('success', 'Dibaca');
            }

            return response()->json(['message' => 'Notifikasi tidak ditemukan.'], 404);

        }catch(Exception $e){
            return response()->json(['message' => 'Gagal memperbarui notifikasi: ' . $e->getMessage()], 500);
        }

    }

    public function delete_notif ($id, $notif_id) {
        Notifikasi::where('id', $notif_id)->delete();

        $this->broadcastUpdate($id);

        return back()->with('success', 'Berhasil delete notifikasi');
    }

    private function broadcastUpdate ($id_user) {
        broadcast(new NotifikasiEvent($id_user));
    }
}
