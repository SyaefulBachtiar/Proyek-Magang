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
        Schema::create('tim_perusahaan', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('nama_tim',100)->nullable();
            $table->text('deskripsi_tim')->nullable();
            $table->string('image')->nullable();
            $table->string('jenis_tim', 20)->nullable();
            $table->string('perusahaan_id', 36);
            $table->string('user_id', 36);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('perusahaan_id')->references('id')->on('perusahaan')->onDelete('cascade');
            $table->timestamps();
        });

        // anggota tim perusahaan
        Schema::create('anggota_tim', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('id_users', 36)->nullable();
            $table->string('role_anggota')->nullable();
            $table->foreign('id_users')->references('id')->on('users')->onDelete('cascade');
            $table->string('id_tim_perusahaan', 36);
            $table->foreign('id_tim_perusahaan')->references('id')->on('tim_perusahaan')->onDelete('cascade');
            $table->timestamps();
        });

        // board
        Schema::create('board_tim', function (Blueprint $table){
            $table->string('id', 36)->primary();
            $table->string('id_team', 36);
            $table->foreign('id_team')->references('id')->on('tim_perusahaan')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('tim_perusahaan');
        Schema::enableForeignKeyConstraints();
        Schema::dropIfExists('anggota_tim');
        Schema::dropIfExists('board_tim');
    }
};
