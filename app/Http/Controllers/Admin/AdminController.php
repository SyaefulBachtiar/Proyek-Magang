<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Perusahaan;
use App\Models\Anggota_perusahaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        $companies = Perusahaan::with([
                'user',
                'anggotaPerusahaan.user'
            ])
            ->when($request->term, function ($query, $term) {
               
                $query->where('nama_perusahaan', 'like', '%' . $term . '%')
                      ->orWhereHas('user', function($q) use ($term) {
                          $q->where('name', 'like', '%' . $term . '%')
                            ->orWhere('email', 'like', '%' . $term . '%');
                      });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Dashboard', [
            'companies' => $companies,
            'filters' => $request->only(['term']),
        ]);
    }

    public function approve($id)
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'active']);
        return redirect()->back()->with('success', 'Akun berhasil diaktifkan.');
    }

    public function deactivate($id)
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'inactive']);
        return redirect()->back()->with('success', 'Akun berhasil dinonaktifkan.');
    }

    public function destroy($id)
    {
        $user = User::with('perusahaan')->findOrFail($id);

        if ($user->perusahaan) {
            $perusahaanId = $user->perusahaan->id;
            $karyawanIds = Anggota_perusahaan::where('perusahaan_id', $perusahaanId)
                ->where('user_id', '!=', $user->id) 
                ->pluck('user_id');

            if ($karyawanIds->count() > 0) {
                User::whereIn('id', $karyawanIds)->delete();
            }
        }
        $user->delete();

        return redirect()->back()->with('success', 'Perusahaan dan seluruh anggotanya dihapus.');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return redirect()->back()->with('success', 'Password Administrator berhasil diperbarui.');
    }
}