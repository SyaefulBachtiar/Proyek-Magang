<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. BUAT TABEL UTAMA (PENGUMUMAN)
        Schema::create('pengumuman', function (Blueprint $table) {
            $table->string('id', 36)->primary(); // UUID

            // Relasi ke Tim
            $table->string('id_tim', 36);
            $table->foreign('id_tim')->references('id')->on('tim_perusahaan')->onDelete('cascade');
            
            // Relasi ke User Pembuat
            $table->string('user_id', 36);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->string('judul');
            $table->text('isi');
            $table->timestamps();
        });

        // 2. BUAT TABEL STATUS BACA (READ_AT_PENGUMUMAN)
        Schema::create('read_at_pengumuman', function (Blueprint $table) {
            $table->string('id', 36)->primary(); // UUID

            // Relasi ke Pengumuman (Foreign Key)
            $table->string('id_pengumuman', 36);
            $table->foreign('id_pengumuman')->references('id')->on('pengumuman')->onDelete('cascade');
            
            // Relasi ke User yang membaca
            $table->string('id_user_read', 36);
            $table->foreign('id_user_read')->references('id')->on('users')->onDelete('cascade');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Hapus tabel anak dulu, baru induknya
        Schema::dropIfExists('read_at_pengumuman');
        Schema::dropIfExists('pengumuman');
    }
};