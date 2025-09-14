<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('id_tim', 36);
            $table->foreign('id_tim')->references('id')->on('tim_perusahaan')->onDelete('cascade');
            $table->string('sender_id', 36);
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('parent_id', 36)->nullable();
            $table->foreign('parent_id')->references('id')->on('messages')->onDelete('cascade');
            $table->longText('pesan');
            $table->timestamps();
        });

        Schema::create(('read_at_mesaage'), function (Blueprint $table){
            $table->string('id', 36)->primary();
            $table->string('id_message', 36);
            $table->foreign('id_message')->references('id')->on('messages')->onDelete('cascade');
            $table->string('id_user_read', 36);
            $table->foreign('id_user_read')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create(('files_message'), function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('id_message', 36);
            $table->foreign('id_message')->references('id')->on('messages')->onDelete('cascade');
            $table->string('file');
            $table->timestamps();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
        Schema::dropIfExists('read_at_mesaage');
        Schema::dropIfExists('files_message');
    }
};
