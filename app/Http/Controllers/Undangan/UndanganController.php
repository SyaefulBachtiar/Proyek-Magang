<?php

namespace App\Http\Controllers\Undangan;

use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Mail\UndanganGabungTim;

class UndanganController extends Controller
{
    public function kirim(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'role' => 'required|string',
        ]);

        // Kirim email
        Mail::to($request->email)->send(new UndanganGabungTim($request->email, $request->role));

        return back()->with('status', 'Undangan berhasil dikirim.');
    }
}
