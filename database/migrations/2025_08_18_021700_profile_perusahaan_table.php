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
        Schema::create('profile_perusahaan', function (Blueprint $table) {
            // Primary Key (UUID)
            $table->uuid('id')->primary();
            
            // Foreign Key ke tabel perusahaan (UUID)
            $table->uuid('perusahaan_id');
            
            // Profile Information
            $table->text('deskripsi')->nullable();
            $table->enum('role_perusahaan', ['main', 'branch'])->default('main');
            
            // Logo/Profile Picture
            $table->string('foto_profile_perusahaan')->nullable();
            
            // Timestamps
            $table->timestamps();
            
            // Indexes untuk performance
            $table->index('role_perusahaan');
            $table->index('perusahaan_id');
            
            // Foreign key constraint
            $table->foreign('perusahaan_id')
                  ->references('id')
                  ->on('perusahaan')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profile_perusahaan');
    }
};