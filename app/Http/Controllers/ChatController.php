<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    // Tampilkan halaman chat beserta semua pesan
    public function index($id)
    {
        $messages = ChatMessage::with('user')->latest()->take(50)->get()->reverse()->values();

        return Inertia::render('ChatGroup', [
            'messages' => $messages,
            'user' => auth()->user(),
        ]);
    }

    // Simpan pesan baru
    public function store(Request $request)
    {
        $request->validate([
            'message' => 'required|string'
        ]);

        ChatMessage::create([
            'user_id' => auth()->id(),
            'body' => $request->message,
        ]);

        return back();
    }
}
