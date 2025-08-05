<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PengaturanController extends Controller
{
    public function index ($id) {
        // Cek apakah user sudah login
        if (Auth::id() != $id) {
        abort(403, 'Unauthorized.');
        }

        $user = Auth::user();
        $data = optional($user->profile_perusahaan)->toArray();
        return Inertia::render('pageDashboard/ContentPengaturan', [
            'activePage' => 'DashboardPengaturan',
            'data' => $data,
        ]);
    }
}

