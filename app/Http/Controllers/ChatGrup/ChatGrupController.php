<?php

namespace App\Http\Controllers\ChatGrup;

use App\Events\BoardUpdated;
use App\Http\Controllers\Controller;
use App\Models\TimPerusahaan\Messages;
use App\Models\TimPerusahaan\ReadAtMessage;
use App\Models\TimPerusahaan\TimPerusahaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class ChatGrupController extends Controller
{
    public function chatgrup($id, $id_tim)
    {
        $userId = Auth::id();

        $unreadMessages = Messages::where('id_tim', $id_tim)
            ->whereDoesntHave('read', function($q) use ($userId) {
                $q->where('id_user_read', $userId);
            })
            ->pluck('id');

        $readData = [];
        foreach ($unreadMessages as $msgId) {
            $readData[] = [
                'id' => (string) Str::uuid(),
                'id_message' => $msgId,
                'id_user_read' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if (!empty($readData)) {
            ReadAtMessage::insert($readData);
        }

        $messages = Messages::where('id_tim', $id_tim)
            ->with(['sender', 'file', 'parent.sender'])
            ->orderBy('created_at', 'asc')
            ->get();

        $dataChat = $messages->map(function ($message) {
            $files = $message->file->map(function ($file) {
                return [
                    'file' => Storage::url($file->file)
                ];
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
                'parent_message' => $message->parent ? [
                    'pesan' => $message->parent->pesan,
                    'sender_name' => optional($message->parent->sender)->name,
                ] : null,
            ];
        });

        $tim = TimPerusahaan::with(['board_tim'])
            ->withCount(['messages as unread_messages_count' => function ($query) use ($userId) {
                $query->whereDoesntHave('read', function ($q) use ($userId) {
                    $q->where('id_user_read', $userId);
                });
            }])
            ->withCount(['pengumuman as unread_announcements_count' => function ($query) use ($userId) {
                $query->whereDoesntHave('read', function ($q) use ($userId) {
                    $q->where('id_user_read', $userId);
                });
            }])
            ->findOrFail($id_tim);

        $id_board = $tim->board_tim->id;

        return Inertia::render('pageProyek/ChatGrup', [
            'dashboardId' => $id,
            'activePage' => 'chatGrupPage',
            'tim' => $tim,
            'chating' => $dataChat,
            'id_board' => $id_board
        ]);
    }

    public function kirim_pesan(Request $request, $id, $id_tim)
    {
        $request->validate([
            'pesan_text' => 'nullable|string',
            'id_pesan_balas' => 'nullable|string',
            'pesan_file.*' => 'nullable|file|mimes:jpeg,png,pdf,doc,docx,xlsx|max:10240'
        ]);

        if (empty($request->pesan_text) && empty($request->pesan_file)) {
            return response()->json(['message' => 'Pesan tidak boleh kosong.'], 400);
        }

        DB::beginTransaction();

        try {
            $message = Messages::create([
                'id' => (string) Str::uuid(),
                'id_tim' => $id_tim,
                'sender_id' => $id,
                'pesan' => $request->pesan_text ?? '',
                'parent_id' => $request->id_pesan_balas ?? null
            ]);

            if ($request->hasFile('pesan_file')) {
                foreach ($request->pesan_file as $uploadFile) {
                    $filePath = $uploadFile->store('chatgroup', 'public');

                    $message->file()->create([
                        'id' => (string) Str::uuid(),
                        'id_message' => $message->id,
                        'file' => $filePath,
                    ]);
                }
            }

            $timPerusahaan = TimPerusahaan::with('board_tim')->where('id', $id_tim)->first();
            $id_board = $timPerusahaan->board_tim->id;

            broadcast(new BoardUpdated($id_board, 'chat'))->toOthers();

            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Gagal mengirim pesan.', 'error' => $e->getMessage()], 500);
        }
    }

    public function delete_pesan($id, $id_pesan)
    {
        $hapus_pesan = Messages::with('tim.board_tim')->findOrFail($id_pesan);

        $id_board = $hapus_pesan->tim->board_tim->id;

        foreach ($hapus_pesan->file as $file) {
            Storage::disk('public')->delete($file->file);
        }

        $hapus_pesan->delete();

        broadcast(new BoardUpdated($id_board, 'chat'))->toOthers();
    }

    public function edit_pesan(Request $request, $id, $id_pesan)
    {
        $request->validate([
            'pesan_text' => 'nullable|string',
        ]);

        $pesan = Messages::with('tim.board_tim')->findOrFail($id_pesan);

        $id_board = $pesan->tim->board_tim->id;

        $pesan->update([
            'pesan' => $request->pesan_text
        ]);

        broadcast(new BoardUpdated($id_board, 'chat'))->toOthers();
    }
}