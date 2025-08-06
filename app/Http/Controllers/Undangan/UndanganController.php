<?php

namespace App\Http\Controllers\Undangan;

use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Mail\UndanganGabungTim;
use App\Models\Undangan\Undangan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

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
        'id' => strtoupper(Str::random(20)),
        'email' => $request->email,
        'role' => $request->role,
        'id_perusahaan' => $user->id_perusahaan, // ambil dari user yang login
    ]);

    // 2. BUAT URL YANG SUDAH DITANDATANGANI DAN BERLAKU 7 HARI
        $signedUrl = URL::temporarySignedRoute(
            'register', // Nama route
            now()->addDays(7), // Waktu kedaluwarsa
            ['undangan' => $undangan->id] // Parameter yang ingin disertakan
        );

        // 3. KIRIM URL LENGKAP KE MAILABLE
        Mail::to($request->email)->send(
            new UndanganGabungTim($request->email, $request->role, $signedUrl)
        );

        return back()->with('status', 'Undangan aman berhasil dikirim.');
    }
}
