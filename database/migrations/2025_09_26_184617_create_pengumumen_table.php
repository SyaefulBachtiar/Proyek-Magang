<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('pengumuman', function (Blueprint $table) {
            // Primary key untuk tabel pengumuman ini sendiri bisa berupa angka auto-increment
            $table->id();

            // Foreign key yang merujuk ke primary key tipe UUID (CHAR 36)
            $table->foreignUuid('id_tim')->constrained('tim_perusahaan')->onDelete('cascade');
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');

            $table->string('judul');
            $table->text('isi');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('pengumuman');
    }
};