<?php

namespace App\Http\Middleware;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
        public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user()
                    ? [
                        'id' => $request->user()->id,
                        'name' => $request->user()->name,
                        'email' => $request->user()->email,
                    ]
                    : null,
            ],
             'perusahaan' => function () use ($request) {
                $user = $request->user();
                return $user && $user->perusahaan 
                    ? $user->perusahaan->nama_perusahaan
                    : null;
                },
                'timLayout' => function () use ($request) {
                    // 1. Ambil user yang sedang login beserta relasi perusahaannya
                    $currentUser = $request->user();

                    // 2. Pastikan user dan relasi perusahaannya ada
                    if (! $currentUser || ! $currentUser->perusahaan) {
                        return []; // Sudah benar, kembalikan array kosong
                    }

                    // 3. Ambil nama perusahaan dari user yang login
                    $namaPerusahaan = $currentUser->perusahaan->nama_perusahaan;

                    // 4. Cari semua user yang berada di perusahaan yang sama menggunakan relasi
                    // Ini adalah cara yang jauh lebih bersih dan aman
                    return User::whereHas('perusahaan', function ($query) use ($namaPerusahaan) {
                        $query->where('nama_perusahaan', $namaPerusahaan);
                    })
                    ->with('perusahaan:id,user_id,role') // Eager load hanya kolom yang perlu
                    ->get()
                    ->map(function ($user) {
                        // 5. Bentuk data secara manual agar struktur outputnya pasti dan tidak bocor
                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            // Gunakan null-safe di sini untuk keamanan ekstra
                            'role' => $user->perusahaan?->role, 
                            'jabatan' => $user->perusahaan?->jabatan, // Tambahkan jabatan jika ada
                        ];
                    });
                }

                    ]);
    }
}
