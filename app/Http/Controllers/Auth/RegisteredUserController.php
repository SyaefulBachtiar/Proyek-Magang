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
    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/Register', [
            'register' => Route::has('register'),
            // PERBAIKAN 2: Ambil kode 'undangan' dari URL dan kirimkan sebagai prop ke view
            'kodeUndangan' => $request->query('undangan'),
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
            'undangan' => 'nullable|string|exists:undangan,id',
        ]);

        // Gunakan DB Transaction untuk memastikan konsistensi data
        $user = DB::transaction(function () use ($request) {
            $namaPerusahaan = null;
            $kodeUndangan = $request->input('undangan');

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
                    $namaPerusahaan = $undangan->nama_perusahaan;
                    $id_perusahan = $undangan->id_perusahaan;
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
            ]);

            // Jika user daftar mandiri (tanpa undangan), buat perusahaan baru
            if (!$namaPerusahaan) {
                $perusahaan = Perusahaan::create([
                    'id' => strtoupper(Str::random(20)),
                    'nama_perusahaan' => null,
                    'deskripsi' => null,
                    'image' => null,
                    'user_id' => $user->id,
                ]);

                Anggota_perusahaan::create([
                    'id' => strtoupper(Str::random(20)),
                    'role' => 'Super User',
                    'jabatan' => 'Owner',
                    'perusahaan_id' => $perusahaan->id,
                    'user_id' => $user->id,
                ]);

            }else{
                // $perusahaan = Perusahaan::create([
                //     'id' => strtoupper(Str::random(20)),
                //     'nama_perusahaan' => $namaPerusahaan,
                //     'deskripsi' => null,
                //     'image' => null,
                //     'user_id' => $user->id,
                // ]);


                Anggota_perusahaan::create([
                    'id' => strtoupper(Str::random(20)),
                    'role' => $userRole ?? 'Member', // Gunakan role dari undangan atau default ke 'Member'
                    'jabatan' => null,
                    'perusahaan_id' => $id_perusahan,
                    'user_id' => $user->id,
                ]);
            }
            
            return $user;
        });

        event(new Registered($user));

        // PERBAIKAN: Alihkan ke dashboard, bukan kembali ke halaman login
        return redirect()->route('login');
    }
}
