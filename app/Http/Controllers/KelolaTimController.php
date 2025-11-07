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
    public function index(Request $request, $id, $id_tim)
    {
        $tim = TimPerusahaan::findOrFail($id_tim);
        $perusahaan_id = $id; 
        
        $searchQuery = $request->input('search');
        $query = Anggota_tim::with('user')
            ->where('id_tim_perusahaan', $id_tim);
        if ($searchQuery) {
            $query->whereHas('user', function ($q) use ($searchQuery) {
                $q->where('name', 'like', '%' . $searchQuery . '%');
            });
        }
        $anggotaList = $query->get()
            ->map(function ($anggota) use ($perusahaan_id) {
                $anggotaPerusahaan = Anggota_perusahaan::where('user_id', $anggota->user->id)
                                                     ->where('perusahaan_id', $perusahaan_id)
                                                     ->first();
                                                     
                $anggota->user_company_role = $anggotaPerusahaan ? $anggotaPerusahaan->role : null;
                return $anggota;
            });
            
        $anggotaList = $anggotaList
            ->sortBy('user.name') 
            ->sortByDesc(function ($anggota) { 
                return strtolower($anggota->user_company_role) === 'super user';
            })->values();

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
            'filters' => ['search' => $searchQuery] 
        ]);
    }

    public function updateRole(Request $request, $id, $id_tim)
    {
        $request->validate([
            'anggota_tim_id' => 'required|string|exists:anggota_tim,id',
            'new_role' => 'required|string',
        ]);

        $currentUser = Auth::user();
        $perusahaan_id = $id;

        $currentUserTeamRole = Anggota_tim::where('id_users', $currentUser->id)->where('id_tim_perusahaan', $id_tim)->first()->role_anggota ?? null;
        $currentUserCompanyRole = Anggota_perusahaan::where('user_id', $currentUser->id)->where('perusahaan_id', $perusahaan_id)->first()->role ?? null;

        $canEdit = (strtolower($currentUserTeamRole) === 'ketua tim' || strtolower($currentUserCompanyRole) === 'super user');

        if (!$canEdit) {
            return Redirect::back()->withErrors(['message' => 'Anda tidak memiliki izin untuk mengubah role.']);
        }

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