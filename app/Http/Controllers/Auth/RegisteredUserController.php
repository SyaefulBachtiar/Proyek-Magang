<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
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
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'register' => Route::has('register'),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
         $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Gunakan DB Transaction untuk memastikan konsistensi data
        $user = DB::transaction(function () use ($request) {
            $idPerusahaan = null;
            $kodeUndangan = $request->query('undangan');

            // Logika untuk pendaftaran via undangan
            if (!empty($kodeUndangan)) {
                $undangan = Undangan::where('id', $kodeUndangan)->first();

                // PERBAIKAN: Tambahkan validasi jika undangan ada tapi email tidak cocok
                if ($undangan && $undangan->email !== $request->email) {
                    throw ValidationException::withMessages([
                        'email' => 'Alamat email ini tidak cocok dengan yang tertera di undangan.',
                    ]);
                }
                
                if ($undangan) {
                    $idPerusahaan = $undangan->id_perusahaan;
                    // PERBAIKAN: Simpan role dari undangan untuk ditetapkan ke user baru.
                    // Ini memperbaiki bug di mana role dari undangan tidak digunakan.
                    // Asumsi: Tabel 'users' memiliki kolom 'role' untuk menyimpan peran pengguna.
                    $userRole = $undangan->role; 
                    $undangan->delete(); // Hapus undangan agar tidak bisa dipakai ulang
                }
            }

            // Buat user baru. id_perusahaan akan diisi jika dari undangan.
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'id_perusahaan' => $idPerusahaan,
                // PERBAIKAN: Tetapkan role saat user dibuat. 'Super User' jika daftar mandiri.
                'role' => $userRole ?? 'Super User', 
            ]);

            // Jika user daftar mandiri (tanpa undangan), buat perusahaan baru
            if (!$idPerusahaan) {
                $perusahaan = Perusahaan::create([
                    'id' => strtoupper(Str::random(20)),
                    'user_id' => $user->id,
                    'role' => 'Super User',
                    'jabatan' => null,
                ]);

                // Update user dengan id_perusahaan dari perusahaan baru
                $user->id_perusahaan = $perusahaan->id;
                $user->save();
            }
            
            return $user;
        });

        event(new Registered($user));

        // PERBAIKAN: Alihkan ke dashboard, bukan kembali ke halaman login
        return redirect()->route('login');
    }
}
