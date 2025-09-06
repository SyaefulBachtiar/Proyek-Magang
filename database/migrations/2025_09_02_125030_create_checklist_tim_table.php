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
        Schema::create('title_checklist', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('title');
            $table->string('id_tim_perusahaan', 36)->nullable();
            $table->foreign('id_tim_perusahaan')->references('id')->on('tim_perusahaan')->onDelete('cascade');
            $table->string('id_card', 36)->nullable();
            $table->foreign('id_card')->references('id')->on('card_list')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('checklist', function (Blueprint $table){
            $table->string('id', 36)->primary();
            $table->string('title')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_checked')->default(false)->nullable();
            $table->string('id_title_checklist', 36)->nullable();
            $table->foreign('id_title_checklist')->references('id')->on('title_checklist')->onDelete('cascade');
            $table->string('id_card', 36)->nullable();
            $table->foreign('id_card')->references('id')->on('card_list')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('title_checklist');
        Schema::dropIfExists('checklist');
    }
};
