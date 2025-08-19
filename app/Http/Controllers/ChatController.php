<?php

// app/Http/Controllers/ChatController.php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\TimPerusahaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChatController extends Controller
{
    /**
     * Halaman chat grup tim
     */
    public function index($timId)
    {
        try {
            // Ambil data tim
            $tim = TimPerusahaan::with('leader')->findOrFail($timId);
            
            // Ambil messages tim
            $messages = Message::where('tim_id', $timId)
                ->with('user:id,name')
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function ($msg) {
                    return [
                        'id' => $msg->id,
                        'pesan' => $msg->pesan,
                        'user_id' => $msg->user_id,
                        'user_name' => $msg->user->name,
                        'waktu' => $msg->created_at->format('H:i'),
                        'tanggal' => $msg->created_at->format('d/m/Y'),
                        'created_at' => $msg->created_at->toISOString(),
                    ];
                });

            // Mark messages as read untuk user ini
            Message::where('tim_id', $timId)
                ->where('user_id', '!=', Auth::id())
                ->where('is_read', false)
                ->update(['is_read' => true]);

            return Inertia::render('Chat/ChatGrup', [
                'messages' => $messages,
                'tim' => [
                    'id' => $tim->id,
                    'nama' => $tim->nama_tim,
                    'deskripsi' => $tim->deskripsi_tim,
                    'leader' => $tim->leader ? $tim->leader->name : null,
                ],
                'user' => Auth::user(),
            ]);

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Tim tidak ditemukan');
        }
    }

    /**
     * Kirim pesan baru
     */
    public function store(Request $request)
    {
        $request->validate([
            'tim_id' => 'required|exists:tim_perusahaan,id',
            'pesan' => 'required|string|max:1000',
        ]);

        try {
            $message = Message::create([
                'user_id' => Auth::id(),
                'tim_id' => $request->tim_id,
                'pesan' => $request->pesan,
            ]);

            // Load relasi user untuk response
            $message->load('user:id,name');

            return response()->json([
                'success' => true,
                'message' => [
                    'id' => $message->id,
                    'pesan' => $message->pesan,
                    'user_id' => $message->user_id,
                    'user_name' => $message->user->name,
                    'waktu' => $message->created_at->format('H:i'),
                    'tanggal' => $message->created_at->format('d/m/Y'),
                    'created_at' => $message->created_at->toISOString(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim pesan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ambil pesan baru (polling)
     */
    public function getNewMessages(Request $request, $timId)
    {
        $lastId = $request->get('last_id', 0);

        $newMessages = Message::where('tim_id', $timId)
            ->where('id', '>', $lastId)
            ->with('user:id,name')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'pesan' => $msg->pesan,
                    'user_id' => $msg->user_id,
                    'user_name' => $msg->user->name,
                    'waktu' => $msg->created_at->format('H:i'),
                    'tanggal' => $msg->created_at->format('d/m/Y'),
                    'created_at' => $msg->created_at->toISOString(),
                ];
            });

        return response()->json([
            'success' => true,
            'messages' => $newMessages
        ]);
    }
}