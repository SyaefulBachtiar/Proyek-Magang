<?php

use App\Http\Controllers\ProfilePengaturanController;
use App\Http\Controllers\AksesTimController;
use App\Http\Controllers\ChatGrup\ChatGrupController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PengaturanController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProyekController;
use App\Http\Controllers\Komentar\KomenController;
use App\Http\Controllers\Laporan\LaporanController;
use App\Http\Controllers\Notif\NotifikasiController;
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

Route::get('/dashboard', function () {
    $id = Auth::id();
    return redirect()->route('dashboard.with.id', ['id' => $id]);
})->name('dashboard.fallback');

Route::middleware(['auth'])->prefix('dashboard/{id}')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard.with.id');

    // Halaman Proyek
    Route::get('/proyek/{id_tim}/board/{id_board}', [ProyekController::class, 'index'])->name('proyek');
    Route::get('/proyek/{id_tim}/ringkas', [ProyekController::class, 'ringkas'])->name('proyek.ringkas');
    Route::get('/proyek/{id_tim}/laporan', [LaporanController::class, 'laporan'])->name('proyek.laporan');
    Route::get('/proyek/{id_tim}/chatgrup', [ChatGrupController::class, 'chatgrup'])->name('proyek.chatgrup');
    Route::get('/proyek/{id_tim}/card/{cardId}', [ProyekController::class, 'showCard'])->name('proyek.card');

    // Tambah anggota Card Kanban
    Route::post('proyek/{id_user}/card/{cardId}', [ProyekController::class, 'tambah_anggota_card'])->name('proyek.card.invite');
    Route::delete('proyek/{id_user}/{cardId}', [ProyekController::class, 'destroy_anggota_card'])->name('proyek.card.destroy');

    // Aksi Proyek (POST/PUT/DELETE)
    Route::post('/proyek/update-list-order', [ProyekController::class, 'updateListOrder'])->name('proyek.update-list-order');
    Route::post('/proyek/update-card-order', [ProyekController::class, 'updateCardOrder'])->name('proyek.update-card-order');
    Route::post('/proyek/{id_tim}/board/{id_board}/card', [ProyekController::class, 'storeCard'])->name('proyek.card.store');
    Route::post('/proyek/list/{id_board}', [ProyekController::class, 'storeList'])->name('proyek.list.store');
    Route::put('/proyek/list/{id_list}/update-title', [ProyekController::class, 'updateListTitle'])->name('proyek.list.update.title'); // <-- RUTE BARU
    
    // Menghapus Anggota
    Route::delete('/proyek/{id_tim}/anggota/{id_user}', [ProyekController::class, 'hapusAnggota'])->name('proyek.anggota.destroy');

    //  MENAMBAH ANGGOTA TIM
    Route::post('/proyek/{id_tim}/anggota', [ProyekController::class, 'tambahAnggota'])->name('proyek.anggota.store');

    // Halaman lain
    Route::get('/aksestim', [AksesTimController::class, 'index'])->name('aksestim');
    Route::put('/aksestim/{user}/update-role', [AksesTimController::class, 'updateRole'])->name('aksestim.updateRole');
    // RUTE BARU UNTUK HAPUS USER
    Route::delete('/aksestim/{user}', [AksesTimController::class, 'destroy'])->name('aksestim.destroy');
    
    // Rute untuk halaman Pengaturan
    Route::get('/pengaturan', [PengaturanController::class, 'index'])->name('pengaturan');
    // Rute untuk menangani update form
    Route::post('/pengaturan', [PengaturanController::class, 'update'])->name('pengaturan.update');

    Route::get('/leaderboard', [LeaderboardController::class, 'index'])->name('leaderboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Manajemen Tim & Perusahaan
    Route::post('/tim-perusahaan', [Tim_perusahaanController::class, 'store'])->name('tim-perusahaan.store');
    Route::delete('/tim-perusahaan/{id_tim}', [Tim_perusahaanController::class, 'destroy'])->name('tim-perusahaan.destroy');
    Route::put('/tim-perusahaan/{id_tim}', [Tim_perusahaanController::class, 'update'])->name('tim-perusahaan.update');
    Route::put('/perusahaan', [DashboardController::class, 'update_perusahaan'])->name('perusahaan.update');

    // KALENDER
    Route::post('proyek/card/{cardId}', [ProyekController::class, 'kalender_store'])->name('kalender.store');
    Route::put('proyek/card/{kalender_id}/update', [ProyekController::class, 'kalender_update'])->name('kalender.update');
    Route::delete('proyek/card/{kalender_id}/update', [ProyekController::class, 'kalender_delete'])->name('kalender.delete');

    // LABEL TIM
    Route::post('proyek/card/{id_card}/{id_tim}/label', [ProyekController::class, 'label_store'])->name('label.store');
    Route::put('proyek/card/{id_tim}/{id_label}/label/update', [ProyekController::class, 'label_update'])->name('label.update');
    Route::delete('proyek/card/{label_id}', [ProyekController::class, 'label_delete'])->name('label.delete');
    
    // LABEL CARD
    Route::post('card/{id_card}', [ProyekController::class, 'label_card_store'])->name('label.card.store');
    Route::delete('card/{card_id}/label/{label_id}', [ProyekController::class, 'label_card_delete'])->name('label.card.delete');

    // NOTIFIKASI
    Route::post('notifikasi/{notif_id}/read', [NotifikasiController::class, 'mark_read'])->name('mark.read.notif');
    Route::delete('notifikasi/{notif_id}/delete', [NotifikasiController::class, 'delete_notif'])->name('delete.notif');

    // CHECKLIST
    Route::post('{id_tim}/{id_card}/title-checklist', [ProyekController::class, 'store_checklist'])->name('store.title.checklist');
    Route::post('checklist/{id_card}', [ProyekController::class, 'store_item_checklist'])->name('store.item.checklist');
    Route::put('{checklist_id}/checklist', [ProyekController::class, 'update_checklist'])->name('update.checklist.check');
    Route::put('{checklist_id}', [ProyekController::class, 'update_notchecklist'])->name('update.checklist.notcheck');
    Route::put('checklist/{checklist_id}/delete', [ProyekController::class, 'delete_image_checklist'])->name('delete.image.checklist');
    Route::put('checklist/{id_check}/update', [ProyekController::class, 'update_title_checklist'])->name('update.title.checklist');
    ROute::put('checklist/{id_checklist}', [ProyekController::class, 'update_delete_checklist'])->name('update.delete.checklist');
    Route::post('{checklist_id}/checklist', [ProyekController::class, 'upload_checklist_photo'])->name('upload.checklist.photo');
    Route::delete('checklist/{id_checklist}', [ProyekController::class, 'delete_title_checklist'])->name('delete.title.checklist');


    // DESKRIPSI
    Route::post('deskripsi/{id_card}', [ProyekController::class, 'store_deskripsi'])->name('store.deskripsi');

    // Lampiran
    Route::post('lampiran/{card_id}', [ProyekController::class, 'store_lampiran'])->name('lampiran.store');
    Route::put('lampiran/{lampiran_id}/update', [ProyekController::class, 'update_lampiran'])->name('lampiran.update');
    Route::delete('lampiran/{lampiran_id}', [ProyekController::class, 'destroy_lampiran'])->name('lampiran.destroy');


    // KOMEN
    Route::post('komentar/{id_card}', [KomenController::class, 'komentar'])->name('komentar');
    Route::delete('komentar/{id_komentar}/delete', [KomenController::class, 'delete_komentar'])->name('delete.komentar');
    Route::put('komentar/edit/{id_card}', [KomenController::class, 'edit_komentar'])->name('edit.komentar');

    // CHATING
    Route::post('kirim/pesan/{id_tim}', [ChatGrupController::class, 'kirim_pesan'])->name('kirim.pesan');

});

Route::middleware('auth')->group(function () {
    Route::get('/users', [Tim_perusahaanController::class, 'getUsers']); // untuk modal
});

Route::post('/undangan', [UndanganController::class, 'kirim'])->name('undangan.kirim');

require __DIR__.'/auth.php';