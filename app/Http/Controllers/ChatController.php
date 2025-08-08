<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ChatController extends Controller
{
    /**
     * Tampilkan halaman chat grup berdasarkan tim
     */
    public function index(Request $request, $timId)
    {
        // Cek apakah user memiliki akses ke tim ini
        $tim = \App\Models\TimPerusahaan::findOrFail($timId);
        
        // Ambil pesan untuk tim tertentu
        $messages = Message::byTim($timId)
            ->with('user:id,name')
            ->oldest()
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'text' => $message->message,
                    'user_id' => $message->user_id,
                    'user_name' => $message->user->name,
                    'created_at' => $message->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Ambil anggota tim (jika ada relasi members)
        $timMembers = collect([$tim->leader]); // minimal ada leader
        // Jika ada tabel pivot members: $timMembers = $tim->members;

        return Inertia::render('ChatGrup', [
            'messages' => $messages,
            'user' => Auth::user(),
            'timId' => $timId,
            'tim' => [
                'id' => $tim->id,
                'nama' => $tim->nama_tim,
                'members' => $timMembers->map(fn($member) => [
                    'id' => $member->id,
                    'name' => $member->name
                ])
            ]
        ]);
    }

    /**
     * Simpan pesan baru
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:1000',
            'tim_id' => 'required|integer|exists:tim_perusahaan,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $message = Message::create([
                'user_id' => Auth::id(),
                'tim_perusahaan_id' => $request->tim_id,
                'message' => $request->message // sesuaikan nama column
            ]);

            // Load relasi user untuk response
            $message->load('user:id,name');

            return response()->json([
                'success' => true,
                'message' => [
                    'id' => $message->id,
                    'text' => $message->message,
                    'user_id' => $message->user_id,
                    'user_name' => $message->user->name,
                    'created_at' => $message->created_at->format('Y-m-d H:i:s'),
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim pesan'
            ], 500);
        }
    }

    /**
     * Ambil pesan terbaru untuk polling
     */
    public function getMessages(Request $request, $timId)
    {
        $lastMessageId = $request->get('last_id', 0);

        $messages = Message::where('tim_perusahaan_id', $timId)
            ->where('id', '>', $lastMessageId)
            ->with('user:id,name')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'text' => $message->message,
                    'user_id' => $message->user_id,
                    'user_name' => $message->user->name,
                    'created_at' => $message->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json([
            'success' => true,
            'messages' => $messages
        ]);
    }
}