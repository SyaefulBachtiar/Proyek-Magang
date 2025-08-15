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
        Schema::create('anggota_card', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('id_user', 36)->nullable();
            $table->string('id_tim_perusahaan', 36)->nullable();
            $table->string('id_anggota_tim', 36)->nullable();
            $table->foreign('id_user')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('id_tim_perusahaan')->references('id')->on('tim_perusahaan')->onDelete('cascade');
            $table->foreign('id_anggota_tim')->references('id')->on('anggota_tim')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anggota_card');
    }
};
