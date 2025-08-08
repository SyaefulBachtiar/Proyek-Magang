<?php
use App\Http\Controllers\ProfilePengaturanController;
use App\Http\Controllers\AksesTimController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PengaturanController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProyekController;
use App\Http\Controllers\Tim\Tim_perusahaanController;
use App\Http\Controllers\Undangan\UndanganController;
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
    Route::get('/dashboard', function () {
        $id = Auth::id();
        return redirect()->route('dashboard.with.id', ['id' => $id]); // arahkan ke dashboard/{id}
    })->name('dashboard.fallback');




Route::middleware(['auth'])->prefix('dashboard/{id}')->group(function () {
    // ✅ Route utama, ini yang akan digunakan untuk redirect setelah login
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard.with.id');

    // Halaman Proyek board
    Route::get('/proyek/{id_tim}/board/{id_board}', [ProyekController::class, 'index'])->name('proyek');
    // halaman Proyek ringkas
    Route::get('/proyek/{id_tim}/ringkas', [ProyekController::class, 'ringkas'])->name('proyek.ringkas');
    // halaman proyek laporan
    Route::get('/proyek/{id_tim}/laporan', [ProyekController::class, 'laporan'])->name('proyek.laporan');
    // halaman proyek chat grup
    Route::get('/proyek/{id_tim}/chatgrup', [ProyekController::class, 'chatgrup'])->name('proyek.chatgrup');


    // lihat card
    Route::get('/proyek/{id_tim}/card/{cardId}', [ProyekController::class, 'showCard'])->name('proyek.card');

    // Halaman Akses tim
    Route::get('/aksestim', [AksesTimController::class, 'index'])->name('aksestim');

    // Halaman Pengaturan
    Route::get('/pengaturan', [PengaturanController::class, 'index'])->name('pengaturan');

    // Halaman LeaderBoard
    Route::get('/leaderboard', [LeaderboardController::class, 'index'])->name('leaderboard');

    // profile pengaturan
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // tambah tim
    Route::post('/tim-perusahaan', [Tim_perusahaanController::class, 'store'])->name('tim-perusahaan.store');
    // hapus tim
    Route::delete('/tim-perusahaan/{id_tim}', [Tim_perusahaanController::class, 'destroy'])->name('tim-perusahaan.destroy');
    // edit tim
    Route::put('/tim-perusahaan/{id_tim}', [Tim_perusahaanController::class, 'update'])->name('tim-perusahaan.update');

    // perusahaan update
    Route::put('/perusahaan', [DashboardController::class, 'update_perusahaan'])->name('perusahaan.update');

});


    Route::middleware('auth')->group(function () {
    
    Route::get('/users', [Tim_perusahaanController::class, 'getUsers']); // untuk modal
});

    // kirim undangan    
    Route::post('/undangan', [UndanganController::class, 'kirim'])->name('undangan.kirim'); 


require __DIR__.'/auth.php';
