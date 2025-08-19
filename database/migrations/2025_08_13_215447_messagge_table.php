<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('messages');

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');      // harus sama tipe dengan users.id
            $table->uuid('tim_id');       // harus sama tipe dengan tim_perusahaan.id
            $table->text('pesan');
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('tim_id')->references('id')->on('tim_perusahaan')->onDelete('cascade');

            // Indexes untuk performa
            $table->index(['tim_id', 'created_at'], 'idx_tim_waktu');
            $table->index('user_id', 'idx_user');
            $table->index('created_at', 'idx_waktu');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
