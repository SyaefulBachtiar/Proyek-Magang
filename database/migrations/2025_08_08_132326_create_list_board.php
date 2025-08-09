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
        Schema::create('list_board', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->integer('urutan_posisi');
            $table->string('judul', 30);
            $table->string('id_board', 36);
            $table->foreign('id_board')->references('id')->on('board_tim')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('list_board');
    }
};
