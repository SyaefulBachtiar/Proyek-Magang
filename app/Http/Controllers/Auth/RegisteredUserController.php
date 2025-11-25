<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Anggota_perusahaan;
use App\Models\Perusahaan;
use App\Models\Undangan\Undangan;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class RegisteredUserController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/Register', [
            'register' => Route::has('register'),
            'kodeUndangan' => $request->query('undangan'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
         $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'undangan' => 'nullable|string|exists:undangan,id',
        ]);

        $user = DB::transaction(function () use ($request) {
            $namaPerusahaan = null;
            $kodeUndangan = $request->input('undangan');
            

            $statusAkun = !empty($kodeUndangan) ? 'active' : 'pending'; 

            if (!empty($kodeUndangan)) {
                $undangan = Undangan::where('id', $kodeUndangan)->first();

                if ($undangan && $undangan->email !== $request->email) {
                    throw ValidationException::withMessages([
                        'email' => 'Alamat email ini tidak cocok dengan yang tertera di undangan.',
                    ]);
                }
                
                if ($undangan) {
                    $namaPerusahaan = $undangan->nama_perusahaan;
                    $id_perusahan = $undangan->id_perusahaan;
                    $userRole = $undangan->role; 
                    $undangan->delete(); 
                }
            }

            // Buat user dengan status yang sudah ditentukan
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'status' => $statusAkun, // <--- UPDATE DISINI
            ]);

            // Jika Mandiri (Buat Perusahaan Baru)
            if (!$namaPerusahaan) {
                $perusahaan = Perusahaan::create([
                    'nama_perusahaan' => null,
                    'deskripsi' => null,
                    'image' => null,
                    'user_id' => $user->id,
                ]);

                Anggota_perusahaan::create([
                    'role' => 'Super User',
                    'jabatan' => 'Owner',
                    'perusahaan_id' => $perusahaan->id,
                    'user_id' => $user->id,
                ]);

            } else {
                // Jika via Undangan
                Anggota_perusahaan::create([
                    'role' => $userRole ?? 'Member', 
                    'jabatan' => null,
                    'perusahaan_id' => $id_perusahan,
                    'user_id' => $user->id,
                ]);
            }
            
            return $user;
        });

        event(new Registered($user));

        // PENTING: Jangan login otomatis jika status pending
        if ($user->status === 'pending') {
            return redirect()->route('login')->with('status', 'Registrasi berhasil! Mohon tunggu persetujuan Administrator untuk login.');
        }

        Auth::login($user);

        return redirect()->route('dashboard.fallback');
    }
}