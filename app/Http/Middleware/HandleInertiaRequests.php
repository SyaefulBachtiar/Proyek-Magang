<?php

namespace App\Http\Middleware;

use App\Models\timPerusahaan\BoardModel;
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
                        'poto_profile_user' => $request->user()->poto_profile_user,
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
                    ->with('perusahaan:id,user_id,role,jabatan') // Eager load hanya kolom yang perlu
                    ->get()
                    ->map(function ($user) {
                        // 5. Bentuk data secara manual agar struktur outputnya pasti dan tidak bocor
                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'poto_profile_user' => $user->poto_profile_user,
                            // Gunakan null-safe di sini untuk keamanan ekstra
                            'role' => $user->perusahaan?->role, 
                            'jabatan' => $user->perusahaan?->jabatan, // Tambahkan jabatan jika ada
                            'is_online' => $user->isOnline()
                        ];
                    });
                },
                'timPerusahaan' => function () use ($request) {
                    $user = $request->user();

                    if(!$user){
                        return [];
                    }

                    return $user->tim_perusahaan()->with('anggota_tim_perusahaan.user')->get();
                },
                'id_board' => function () use ($request) {
                    $id_tim = $request->route('id_tim');

                    if(!$id_tim){
                        return null;
                    }

                    $id_board = BoardModel::where('id_team', $id_tim)->value('id');
                    return $id_board;
                },
                'role' => function () use ($request) {
                    $user = $request->user();
                     if(!$user){
                        return [];
                    }

                    $role = optional($user->perusahaan)->role;
                    return $role;
                },
                'anggota_tim' => function () use ($request) {
                    $user = $request->user();
                    if(!$user){
                        return null;
                    }

                    $tim = User::leftJoin('perusahaan', 'users.id', '=', 'perusahaan.user_id')
                    ->where('perusahaan.nama_perusahaan', $user->perusahaan->nama_perusahaan)
                    ->select(
                        'users.id',
                        'users.name',
                        'users.email',
                        'perusahaan.role'
                    )
                    ->get();

                    return $tim;
                },
                'anggota_board' => function () use ($request) {
                $user = $request->user();
                $id_tim = $request->route('id_tim');

                if(!$user || !$id_tim){
                    return null;
                }
                    
                // Cari tim sesuai id_tim yang ada di parameter
                    $tim = $user->tim_perusahaan->firstWhere('id', $id_tim);

                    // Kalau tim ditemukan, ambil nama anggotanya
                    $data = [];
                    if ($tim) {
                        $data = $tim->anggota_tim_perusahaan
                            ->map(fn($anggota) => [
                                'id' => $anggota->user->id ?? null,
                                'name' => $anggota->user->name ?? ''
                            ])
                            ->toArray();
                    }
                    
                return $data;
                }

                    ]);
    }
}
