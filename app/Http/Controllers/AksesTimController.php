<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AksesTimController extends Controller
{
    public function index () {
        return Inertia::render('pageDashboard/ContentAksesTim', [
        'activePage' => 'DashboardAksesTim'
        ]
    );
    }
}
