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
        Schema::create('card_list', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('nama_card', 50)->nullable();
            $table->string('pembuat', 50)->nullable();
            $table->string('image')->nullable();
            $table->string('id_list', 36)->nullable();
            $table->integer('urutan')->nullable();
            $table->foreign('id_list')->references('id')->on('list_board')->onDelete('cascade');
            $table->timestamps();
        });

          // anggota card
        Schema::create('anggota_card', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('id_user', 36)->nullable();
            $table->string('id_card', 36)->nullable();
            $table->foreign('id_user')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('id_card')->references('id')->on('card_list')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_list');
        Schema::dropIfExists('anggota_card');
    }
};
