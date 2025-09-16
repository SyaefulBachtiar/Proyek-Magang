<?php

namespace App\Http\Controllers\ChatGrup;

use App\Events\BoardUpdated;
use App\Http\Controllers\Controller;
use App\Models\timPerusahaan\BoardModel;
use App\Models\TimPerusahaan\Messages;
use App\Models\timPerusahaan\TimPerusahaan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ChatGrupController extends Controller
{
    // CHAT GRUP
    public function chatgrup ($id, $id_tim) {
        $messages = Messages::where('id_tim', $id_tim)->with('sender', 'file')->orderBy('created_at', 'asc')->get();
        $dataChat = $messages->map(function($message) {
            $files = $message->file->map(function ($file){
                return ['file' => $file->file];
            })->all();
            return [
                'id' => $message->id,
                'pesan' => $message->pesan,
                'sender_id' => $message->sender_id,
                'parent_id' => $message->parent_id,
                'updated_at' => $message->created_at,
                'name' => optional($message->sender)->name,
                'poto' => optional($message->sender)->poto_profile_user,
                'file' => $files,
            ];
        });

        $tim = TimPerusahaan::where('id', $id_tim)->first();
        $id_board = $tim->board_tim->id;

        $tim = TimPerusahaan::findOrFail($id_tim);
        return Inertia::render('pageProyek/ChatGrup', [
            'dashboardId' => $id,
            'activePage' => 'chatGrupPage', 
            'tim' => $tim,
            'chating' => $dataChat,
            'id_board' => $id_board
        ]);
    }

    // KIRIM PESAN
    public function kirim_pesan (Request $request, $id, $id_tim) {
        
        $request->validate([
            'pesan_text' => 'nullable|string',
            'id_pesan_balas' => 'nullable|string',
            'pesan_file.*' => 'nullable|file|mimes:jpeg,png,pdf,doc,docx,xlsx|max:10240'
        ]);

        if (empty($request->pesan_text) && empty($request->pesan_file)) {
            return response()->json(['message' => 'Pesan tidak boleh kosong.'], 400);
        }

        DB::beginTransaction();

        try{

            if($request->id_pesan_balas){
                $message = Messages::create([
                'id' => (string) Str::uuid(),
                'id_tim' => $id_tim,
                'sender_id' => $id,
                'pesan' => $request->pesan_text,
                'parent_id' => $request->id_pesan_balas
            ]);
            }else{
                 $message = Messages::create([
                'id' => (string) Str::uuid(),
                'id_tim' => $id_tim,
                'sender_id' => $id,
                'pesan' => $request->pesan_text,
                'parent_id' => null
            ]);
            }

            if($request->hasFile('pesan_file')){
                foreach($request->pesan_file as $uploadFile){
                    $filePath = $uploadFile->store('chat_files', 'public');

                    $message->file()->create([
                        'id' => (string) Str::uuid(),
                        'id_message' => $message->id,
                        'file' => $filePath,
                    ]);
                }
            }


            $timPerusahaan = TimPerusahaan::where('id', $id_tim)->first();
            $id_board = $timPerusahaan->board_tim->id;

            broadcast(new BoardUpdated($id_board));

            DB::commit(); 
        }catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Gagal mengirim pesan.', 'error' => $e->getMessage()], 500);
        }
    }
    
    // HAPUS PESAN
    public function delete_pesan ($id, $id_pesan) {
        $hapus_pesan = Messages::findOrFail($id_pesan);

        $id_board = $hapus_pesan->tim->board_tim->id;

        $hapus_pesan->delete();

        broadcast(new BoardUpdated($id_board));

        // return redirect()->back()->with('success', 'berhasil hapus pesan');
    }

    // EDIT PESAN
    public function edit_pesan (Request $request, $id, $id_pesan) {
        $request->validate([
            'pesan_text' => 'nullable|string',
        ]);

        $pesan = Messages::findOrFail($id_pesan);

        $id_board = $pesan->tim->board_tim->id;

        $pesan->update([
            'pesan' => $request->pesan_text
        ]);

        broadcast(new BoardUpdated($id_board));

        // return redirect()->back()->with('success', 'berhasil edit pesan');
    }
}
