<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index ($id) {
        if (Auth::id() != $id) {
        abort(403, 'Unauthorized.');
    }
        return Inertia::render('pageDashboard/ContentMainDashboard', [
            'activePage' => 'DashboardMain',
            
        ]);
    }
}
