<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfilePengaturanController extends Controller
{
    public function index()
    {
        
        return Inertia::render('Profile/ContentPengaturanProfila', [
            'activePage' => 'DashboardPengaturanProfil',
        ]);
    }
}
