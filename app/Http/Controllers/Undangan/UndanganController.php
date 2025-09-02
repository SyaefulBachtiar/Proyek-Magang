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
    $perusahaan = optional($user->perusahaan)->nama_perusahaan;
    $id_perusahaan = optional($user->perusahaan)->id;

    $undangan = Undangan::create([
        'id' => strtoupper(Str::random(20)),
        'email' => $request->email,
        'role' => $request->role,
        'nama_perusahaan' => $perusahaan,
        'id_perusahaan' => $id_perusahaan,
    ]);

        // 1. SIMPAN UNDUANGAN KE DATABASE
        // Sudah dilakukan di atas dengan Undangan::create()

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

        return back()->with('success', 'Undangan aman berhasil dikirim.');
    }
}
