<?php

namespace App\Http\Middleware;

use App\Models\Anggota_perusahaan;
use App\Models\Perusahaan;
use App\Models\timPerusahaan\BoardModel;
use App\Models\timPerusahaan\Card_listModel;
use App\Models\timPerusahaan\Notifikasi;
use App\Models\timPerusahaan\TimPerusahaan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'new_checklist' => fn () => $request->session()->get('new_checklist'),
                'mention' => fn () => $request->session()->get('mention'),
            ],
             'perusahaan' => function () use ($request) {
                $user = $request->user();
                if(!$user) {
                    return collect();
                }

                $user->load('anggotaPerusahaan.perusahaan');

                return $user->anggotaPerusahaan?->perusahaan?->nama_perusahaan ?? null;

                },
                'nama_board' => function () use ($request) {
                    $id_tim = $request->route('id_tim');
                    $nama_tim = TimPerusahaan::where('id', $id_tim)->value('nama_tim');

                    return $nama_tim;
                },
                'timLayout' => function () use ($request) {
                    // 1. Ambil user yang sedang login beserta relasi perusahaannya
                    $currentUser = $request->user();

                    // 2. Pastikan user dan relasi perusahaannya ada
                    if (!$currentUser || !$currentUser->anggotaPerusahaan) {
                        return []; // Sudah benar, kembalikan array kosong
                    }

                    // 3. Ambil nama perusahaan dari user yang login
                    $namaPerusahaan = $currentUser->anggotaPerusahaan->perusahaan->nama_perusahaan;

                    return User::whereHas('anggotaPerusahaan.perusahaan', function ($query) use ($namaPerusahaan){
                        $query->where('nama_perusahaan', $namaPerusahaan);
                    })
                    ->with('anggotaPerusahaan.perusahaan')
                    ->orderBy('name')
                    ->get()
                    ->map(function ($user) {
                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'poto_profile_user' => $user->poto_profile_user,
                            'role' => $user->anggotaPerusahaan->role,
                            'jabatan' => $user->anggotaPerusahaan->jabatan,
                            'is_online' => $user->isOnline(),
                            'last_seen' => $user->last_seen
                        ];
                    });
                },
                'timPerusahaan' => function () use ($request) {
                    $user = $request->user();

                    if(!$user) {
                        return [];
                    }

                    // $user->load([
                    // 'tim_perusahaan.anggota_tim_perusahaan.user',
                    // 'tim_perusahaan.board_tim.listBoards'
                    // ]);

                    $keanggotaan = $user->anggotaPerusahaan;
                    $role = optional($keanggotaan)->role;
                    $perusahaan = optional($keanggotaan)->perusahaan;

                    if (!$perusahaan){
                        return [];
                    }

                    $query = TimPerusahaan::with([
                            'anggota_tim_perusahaan.user',
                            'board_tim.listBoards',
                            'perusahaan'
                        ])->where('perusahaan_id', $perusahaan->id);

                    if (!in_array($role, ['Super User', 'Admin'])) {
                    // kalau member → hanya tim yang dia bergabung
                    $query->whereHas('anggota_tim_perusahaan', function ($q) use ($user) {
                        $q->where('id_users', $user->id);
                    });
                }

                    $data = $query->get();


                    return $data;
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

                    $role = optional($user->anggotaPerusahaan)->role;
                    return $role;
                },

                // anggota tim
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
                                'name' => $anggota->user->name ?? '',
                                'email' => $anggota->user->email ?? null,
                                'role' => $anggota->role_anggota ?? null,
                            ])
                            ->toArray();
                    }

                return $data;
                },

                'anggota_tim' => function () use ($request) {
                    $user = $request->user();
                    if(!$user){
                        return collect();
                    }
                    $user->load('anggotaPerusahaan');

                    $perusahaan_id = $user->anggotaPerusahaan?->perusahaan_id;

                    if(!$perusahaan_id) {
                        return collect();
                    }



                    $anggota = Anggota_perusahaan::with('user:id,name,email')
                    ->where('perusahaan_id', $perusahaan_id)
                    ->get();

                    return $anggota->map(function ($item){
                        return [
                            'id' => $item->user->id,
                            'name' => $item->user->name,
                            'email' => $item->user->email,
                            'role' => $item->role,
                        ];
                    });
                },

                // anggota card
                'anggota_card' => function () use ($request) {
                    $id_card = $request->route('cardId');

                    if(!$id_card) {
                        return null;
                    }

                    $tim = Card_listModel::with(['anggota_card_list.user', 'anggota_card_list.anggota_tim'])
                    ->find($id_card);
                    
                    $data = [];
                    if($tim) {
                        $data = $tim->anggota_card_list
                        ->map(fn($anggota) => [
                            'id' => $anggota->user->id ?? null,
                            'name' => $anggota->user->name ?? '',
                            'email' => $anggota->user->email ?? null,
                            'image' => $anggota->user->poto_profile_user ?? null,
                            'role' => $anggota->anggota_tim->role_anggota ?? null
                        ])
                        ->toArray();
                    }

                    return $data;
                },

                // NOTIFIKASI
                'notifikasi' => function () use ($request) {
                    $user = $request->user();

                    if(!$user){
                         return [
                        'unread_count' => 0,
                        'items' => [],
                    ];
                    }

                    $unreadCount = Notifikasi::where('user_id', $user->id)->where('is_read', false)->count();

                    $items = Notifikasi::where('user_id', $user->id)->latest()->limit(5)->get();
                    return [
                    'unread_count' => $unreadCount,
                    'items' => $items,
                    ];

                }

                ]);
    }
}
