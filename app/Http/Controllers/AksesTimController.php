<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Anggota_perusahaan; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AksesTimController extends Controller
{
    public function index()
    {
        $currentUser = Auth::user();

        $anggotaInfo = Anggota_perusahaan::where('user_id', $currentUser->id)->firstOrFail();
        $perusahaanId = $anggotaInfo->perusahaan_id;

        $semuaAnggota = Anggota_perusahaan::where('perusahaan_id', $perusahaanId)
            ->with('user')
            ->get();

        $tim = $semuaAnggota->map(function ($anggota) {
            return [
                'id'    => $anggota->user->id,       
                'name'  => $anggota->user->name,     
                'email' => $anggota->user->email,   
                'role'  => $anggota->role,
                'poto_profile_user' => $anggota->user->poto_profile_user 
                    ? asset('storage/' . $anggota->user->poto_profile_user) 
                    : null,           
            ];
        });
            
        return Inertia::render('pageDashboard/ContentAksesTim', [
            'activePage' => 'DashboardAksesTim',
            'tim' => $tim,
        ]);
    }

    public function updateRole(Request $request, $id, $userId)
    {
        $request->validate([
            'role' => 'required|string|in:Admin,Member',
        ]);
        $anggota = Anggota_perusahaan::where('user_id', $userId)->firstOrFail();

        if ($anggota->role === 'Super User') {
            return back()->withErrors(['error' => 'Role Super User tidak dapat diubah.']);
        }
        $anggota->role = $request->input('role');
        $anggota->save();

        return back()->with('success', 'Role berhasil diperbarui.');
    }

    public function destroy($id, $userId)
    {
        $anggota = Anggota_perusahaan::where('user_id', $userId)->first();

        if ($anggota && $anggota->role === 'Super User') {
            return back()->withErrors(['error' => 'User dengan role Super User tidak dapat dihapus.']);
        }
        $userToDelete = User::findOrFail($userId);

        $userToDelete->delete();

        return back()->with('success', 'Anggota tim berhasil dihapus.');
    }
}