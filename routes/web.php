<?php
use App\Http\Controllers\ProfilePengaturanController;
use App\Http\Controllers\AksesTimController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PengaturanController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProyekController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ProfilePerusahaanController;
use App\Http\Controllers\Tim\Tim_perusahaanController;
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
    Route::get('/proyek/{id_tim}/board', [ProyekController::class, 'index'])->name('proyek');
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

    // tambah anggota tim
    Route::post('/tim-perusahaan', [Tim_perusahaanController::class, 'store'])->name('tim-perusahaan.store');
});


    Route::middleware('auth')->group(function () {
    
    Route::get('/users', [Tim_perusahaanController::class, 'getUsers']); // untuk modal
});

Route::middleware(['auth'])->group(function () {
    Route::get('/chat/{dashboardId}', [ChatController::class, 'index'])->name('chat.tim');
    Route::post('/chat/store', [ChatController::class, 'store'])->name('chat.store');
    Route::get('/chat/tim/{timId}/messages', [ChatController::class, 'getMessages'])->name('chat.messages');
});

Route::middleware(['auth'])->prefix('chat')->name('chat.')->group(function () {
    // Halaman chat grup
    Route::get('/tim/{timId}', [ChatController::class, 'index'])->name('tim');
    
    // API kirim pesan
    Route::post('/kirim', [ChatController::class, 'store'])->name('kirim');
    
    // API ambil pesan baru
    Route::get('/tim/{timId}/baru', [ChatController::class, 'getNewMessages'])->name('baru');
});

Route::middleware(['auth'])->group(function () {
    // Routes untuk pengaturan perusahaan utama
    Route::get('/pengaturan', [ProfilePerusahaanController::class, 'index'])->name('pengaturan.index');
    Route::put('/pengaturan', [ProfilePerusahaanController::class, 'update'])->name('pengaturan.update');
    Route::post('/pengaturan/upload-logo', [ProfilePerusahaanController::class, 'uploadLogo'])->name('pengaturan.upload-logo');
    
    // Routes untuk mengelola profile perusahaan spesifik
    Route::get('/profile-perusahaan/{id}', [ProfilePerusahaanController::class, 'show'])->name('profile-perusahaan.show');
    Route::put('/profile-perusahaan/{id}', [ProfilePerusahaanController::class, 'update'])->name('profile-perusahaan.update');
    Route::post('/profile-perusahaan/{id}/upload-logo', [ProfilePerusahaanController::class, 'uploadLogo'])->name('profile-perusahaan.upload-logo');
    
    // Route khusus untuk update dari frontend React
    Route::put('/pengaturan/frontend', [ProfilePerusahaanController::class, 'updateFromFrontend'])->name('pengaturan.update-frontend');
    Route::put('/profile-perusahaan/{id}/frontend', [ProfilePerusahaanController::class, 'updateFromFrontend'])->name('profile-perusahaan.update-frontend');
});

Route::middleware(['auth:sanctum'])->prefix('api')->group(function () {
    Route::get('/profile-perusahaan', [ProfilePerusahaanController::class, 'apiIndex']);
    Route::get('/profile-perusahaan/{id}', [ProfilePerusahaanController::class, 'apiShow']);
    Route::put('/profile-perusahaan/{id}', [ProfilePerusahaanController::class, 'updateFromFrontend']);
    Route::post('/profile-perusahaan/{id}/logo', [ProfilePerusahaanController::class, 'uploadLogo']);
});

// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

require __DIR__.'/auth.php';
