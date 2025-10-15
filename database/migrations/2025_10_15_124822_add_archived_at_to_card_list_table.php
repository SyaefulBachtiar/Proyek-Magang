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
        Schema::table('card_list', function (Blueprint $table) {
            // Menambahkan kolom baru untuk menandai waktu pengarsipan
            $table->timestamp('archived_at')->nullable()->after('urutan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('card_list', function (Blueprint $table) {
            $table->dropColumn('archived_at');
        });
    }
};