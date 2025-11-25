<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Menandai apakah user ini Administrator Platform
            $table->boolean('is_admin')->default(false);
            
            // Status akun: 'active', 'inactive' (dinonaktifkan), 'pending' (menunggu persetujuan)
            $table->string('status')->default('active');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_admin', 'status']);
        });
    }
};