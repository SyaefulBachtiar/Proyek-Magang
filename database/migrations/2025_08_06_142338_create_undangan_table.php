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
        Schema::create('undangan', function (Blueprint $table) {
        $table->id();
        $table->string('email');
        $table->string('role');
        $table->string('id_perusahaan', 36); // tambahkan kolom ini
        $table->timestamps();

        // Relasi foreign key ke tabel perusahaan
        $table->foreign('id_perusahaan')
            ->references('id')
            ->on('perusahaan')
            ->onDelete('cascade');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('undangan');
    }
};
