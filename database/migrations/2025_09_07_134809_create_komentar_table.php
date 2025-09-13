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
        Schema::create('komentar', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('mention')->nullable();
            $table->text('komentar');
            $table->string('lampiran_id')->nullable();
            $table->foreign('lampiran_id')->references('id')->on('lampiran')->onDelete('cascade');
            $table->string('id_user', 36);
            $table->foreign('id_user')->references('id')->on('users')->onDelete('cascade');
            $table->string('id_card', 36);
            $table->foreign('id_card')->references('id')->on('card_list')->onDelete('cascade');
            $table->string('parent_id', 36)->nullable();
            $table->foreign('parent_id')->references('id')->on('komentar')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('komentar');
    }
};
