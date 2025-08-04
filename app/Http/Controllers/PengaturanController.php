<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PengaturanController extends Controller
{
    public function index () {
        // Cek apakah user sudah login
        if (!auth()->Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();
        $data = optional($user->profile_perusahaan)->toArray();
        return Inertia::render('pageDashboard/ContentPengaturan', [
            'activePage' => 'DashboardPengaturan',
            'data' => $data,
        ]);
    }
}

