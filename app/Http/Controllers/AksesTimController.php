<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AksesTimController extends Controller
{
    public function index () {
         $user = User::with('perusahaan')->findOrFail(Auth::id());
         
        $data = $user->perusahaan()->with()->get();
        dd($data);
        return Inertia::render('pageDashboard/ContentAksesTim', [
        'activePage' => 'DashboardAksesTim'
        ]
    );
    }
}
