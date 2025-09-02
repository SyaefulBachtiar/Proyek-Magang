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
        // table perusaan
        Schema::create('perusahaan', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('nama_perusahaan', 100)->nullable();
            $table->string('deskripsi')->nullable();
            $table->string('image')->nullable();
            $table->string('user_id', 36);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });

        // table profile perusahaan
        Schema::create('anggota_perusahaan', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('role')->nullable();
            $table->text('jabatan')->nullable();
             $table->string('user_id', 36);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('perusahaan_id', 36);
            $table->foreign('perusahaan_id')->references('id')->on('perusahaan')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('perusahaan');
        Schema::dropIfExists('anggota_perusahaan');
    }
};
