<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class RingkasController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Ringkas', [
            'dashboardId' => $request->input('dashboardId'),
            'tim' => $request->input('tim'),
            'activePage' => 'dashboard',
        ]);
    }

    public function kanban($id, $id_tim, $id_board)
    {
        return Inertia::render('Ringkas', [
            'dashboardId' => $id,
            'id_tim' => $id_tim,
            'id_board' => $id_board,
            'activePage' => 'kanban',
        ]);
    }
}
