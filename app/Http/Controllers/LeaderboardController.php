<?php

namespace App\Http\Controllers;
use Inertia\Inertia;

use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    public function index () {
        return Inertia::render('pageDashboard/ContentLeaderboard', [
        'activePage' => 'DashboardLeaderboard'
        ]
    );
    }
}
