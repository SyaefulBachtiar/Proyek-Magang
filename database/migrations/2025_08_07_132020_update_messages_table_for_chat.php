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
        Schema::table('messages', function (Blueprint $table) {
            // Tambah kolom yang dibutuhkan untuk chat
            $table->string('user_id', 36);
            $table->string('tim_perusahaan_id', 36)->after('id');
            $table->text('message')->after('tim_perusahaan_id');
            
            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('tim_perusahaan_id')->references('id')->on('tim_perusahaan')->onDelete('cascade');
            
            // Database indexes untuk performance optimal
            $table->index(['tim_perusahaan_id', 'created_at'], 'idx_messages_tim_created');
            $table->index('user_id', 'idx_messages_user');
            $table->index('created_at', 'idx_messages_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Drop indexes dulu
            $table->dropIndex('idx_messages_tim_created');
            $table->dropIndex('idx_messages_user'); 
            $table->dropIndex('idx_messages_time');
            
            // Drop foreign keys
            $table->dropForeign(['user_id']);
            $table->dropForeign(['tim_perusahaan_id']);
            
            // Drop columns
            $table->dropColumn(['user_id', 'tim_perusahaan_id', 'message']);
        });
    }
};