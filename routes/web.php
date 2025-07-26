<?php

use App\Http\Controllers\AksesTimController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PengaturanController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProyekController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});


    // Ganti nama route fallback
    // Route::get('/dashboard', function () {
    //     $id = Auth::id();
    //     return redirect()->route('dashboard.with.id', ['id' => $id]); // arahkan ke dashboard/{id}
    // })->name('dashboard.fallback');




Route::middleware(['auth'])->prefix('dashboard/{id}')->group(function () {
    // ✅ Route utama, ini yang akan digunakan untuk redirect setelah login
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard.with.id');

    // Halaman Proyek
    Route::get('/proyek', [ProyekController::class, 'index'])->name('proyek');
    // lihat card
    Route::get('/proyek/kanban/card/{cardId}/{cardTitle}', [ProyekController::class, 'showCard'])->name('proyek.kanban.card.show');

    // Halaman Akses tim
    Route::get('/aksestim', [AksesTimController::class, 'index'])->name('aksestim');

    // Halaman Pengaturan
    Route::get('/pengaturan', [PengaturanController::class, 'index'])->name('pengaturan');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
