<?php

namespace App\Http\Controllers\Undangan;

use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Mail\UndanganGabungTim;
use App\Models\Undangan\Undangan;
use Illuminate\Support\Facades\Auth;

class UndanganController extends Controller
{
    public function kirim(Request $request)
    {
        $request->validate([
        'email' => 'required|email',
        'role' => 'required|string',
    ]);

    $user = Auth::user();

    

    $undangan = Undangan::create([
        'email' => $request->email,
        'role' => $request->role,
        'id_perusahaan' => $user->id_perusahaan, // ambil dari user yang login
    ]);

    // Kirim email
    Mail::to($request->email)->send(
        new UndanganGabungTim($request->email, $request->role, $undangan->id)
    );

    return back()->with('status', 'Undangan berhasil dikirim.');
    }
}
