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
        Schema::create('label_tim', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('warna');
            $table->string('title');
            $table->string('id_tim_perusahaan', 36);
            $table->foreign('id_tim_perusahaan')->references('id')->on('tim_perusahaan')->onDelete('cascade');
            $table->timestamps();
        });
        Schema::create('label_card', function (Blueprint $table) { 
            $table->string('id', 36)->primary();
            $table->string('warna');
            $table->string('title');
            $table->string('id_label_tim', 36);
            $table->foreign('id_label_tim')->references('id')->on('label_tim')->onDelete('cascade');
            $table->string('id_card', 36);
            $table->foreign('id_card')->references('id')->on('card_list')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('label_card');
        Schema::dropIfExists('lable_tim');
    }
};
