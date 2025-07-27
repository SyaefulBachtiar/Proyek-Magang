<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class PengaturanController extends Controller
{
    public function index () {
        return Inertia::render('pageDashboard/ContentPengaturan', [
            'activePage' => 'DashboardPengaturan'
        ]);
    }
}

