<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profile_perusahaan', function (Blueprint $table) {
            if (!Schema::hasColumn('profile_perusahaan', 'role_perusahaan')) {
                $table->enum('role_perusahaan', ['main', 'branch', 'subsidiary'])->default('main')->after('deskripsi');
            }
        });
    }

    public function down(): void
    {
        Schema::table('profile_perusahaan', function (Blueprint $table) {
            $table->dropColumn('role_perusahaan');
        });
    }
};
