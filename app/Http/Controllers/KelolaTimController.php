<?php

namespace App\Http\Controllers;

use App\Models\timPerusahaan\TimPerusahaan;
use App\Models\timPerusahaan\Anggota_tim;
use App\Models\Anggota_perusahaan;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class KelolaTimController extends Controller
{
    /**
     * Menampilkan halaman daftar anggota tim.
     */
    public function index(Request $request, $id, $id_tim) // 1. Tambahkan Request $request
    {
        $tim = TimPerusahaan::findOrFail($id_tim);
        $perusahaan_id = $id; 
        
        // 2. Ambil query pencarian
        $searchQuery = $request->input('search');

        // 3. Mulai kueri Eloquent
        $query = Anggota_tim::with('user')
            ->where('id_tim_perusahaan', $id_tim);

        // 4. Terapkan filter pencarian jika ada
        if ($searchQuery) {
            $query->whereHas('user', function ($q) use ($searchQuery) {
                $q->where('name', 'like', '%' . $searchQuery . '%');
            });
        }

        // 5. Eksekusi kueri dan lanjutkan proses mapping
        $anggotaList = $query->get()
            ->map(function ($anggota) use ($perusahaan_id) {
                $anggotaPerusahaan = Anggota_perusahaan::where('user_id', $anggota->user->id)
                                                     ->where('perusahaan_id', $perusahaan_id)
                                                     ->first();
                                                     
                $anggota->user_company_role = $anggotaPerusahaan ? $anggotaPerusahaan->role : null;
                return $anggota;
            });
            
        // Blok Pengurutan (Super User di atas)
        $anggotaList = $anggotaList
            ->sortBy('user.name') 
            ->sortByDesc(function ($anggota) { 
                return strtolower($anggota->user_company_role) === 'super user';
            })->values();

        // Dapatkan role user yang sedang login
        $currentUser = Auth::user();
        $currentUserTeamRole = Anggota_tim::where('id_users', $currentUser->id)
                                        ->where('id_tim_perusahaan', $id_tim)
                                        ->first()->role_anggota ?? null;
                                        
        $currentUserCompanyRole = Anggota_perusahaan::where('user_id', $currentUser->id)
                                                ->where('perusahaan_id', $perusahaan_id)
                                                ->first()->role ?? null;

        $canEdit = (strtolower($currentUserTeamRole) === 'ketua tim' || strtolower($currentUserCompanyRole) === 'super user');

        return Inertia::render('pageProyek/KelolaTim', [
            'dashboardId' => $perusahaan_id,
            'activePage' => 'kelolatimPage',
            'tim' => $tim,
            'anggota_list' => $anggotaList,
            'currentAuth' => [
                'id' => $currentUser->id,
                'canEdit' => $canEdit
            ],
            // 6. Kirim filter kembali ke view
            'filters' => ['search' => $searchQuery] 
        ]);
    }

    // Method untuk update role anggota tim.
    public function updateRole(Request $request, $id, $id_tim)
    {
        // Validasi input
        $request->validate([
            'anggota_tim_id' => 'required|string|exists:anggota_tim,id',
            'new_role' => 'required|string', // Validasi 'in:' dihapus, ditangani di bawah
        ]);

        $currentUser = Auth::user();
        $perusahaan_id = $id;

        // Cek hak akses user yang sedang login (case-insensitive)
        $currentUserTeamRole = Anggota_tim::where('id_users', $currentUser->id)->where('id_tim_perusahaan', $id_tim)->first()->role_anggota ?? null;
        $currentUserCompanyRole = Anggota_perusahaan::where('user_id', $currentUser->id)->where('perusahaan_id', $perusahaan_id)->first()->role ?? null;

        $canEdit = (strtolower($currentUserTeamRole) === 'ketua tim' || strtolower($currentUserCompanyRole) === 'super user');

        if (!$canEdit) {
            return Redirect::back()->withErrors(['message' => 'Anda tidak memiliki izin untuk mengubah role.']);
        }

        // Ambil data anggota yang akan di-update
        $anggotaToUpdate = Anggota_tim::findOrFail($request->anggota_tim_id);


        if ($anggotaToUpdate->id_users === $currentUser->id) {
            return Redirect::back()->withErrors(['message' => 'Anda tidak dapat mengubah role Anda sendiri.']);
        }
        $targetUserCompanyRole = Anggota_perusahaan::where('user_id', $anggotaToUpdate->id_users)
                                                ->where('perusahaan_id', $perusahaan_id)
                                                ->first()->role ?? null;
        
        $isUneditable = (strtolower($anggotaToUpdate->role_anggota) === 'ketua tim' && strtolower($targetUserCompanyRole) === 'super user');

        if ($isUneditable) {
            return Redirect::back()->withErrors(['message' => 'Role Super User (Ketua Tim) tidak dapat diubah oleh siapa pun.']);
        }
        if (strtolower($request->new_role) === 'ketua tim') {
            $anggotaToUpdate->role_anggota = 'Ketua Tim';
        } else {
            $anggotaToUpdate->role_anggota = 'Member';
        }
        
        $anggotaToUpdate->save();
        return Redirect::back()->with('success', 'Role anggota berhasil diperbarui.');
    }
}