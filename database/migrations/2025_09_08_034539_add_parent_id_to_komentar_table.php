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
        Schema::table('komentar', function (Blueprint $table) {
            if (!Schema::hasColumn('komentar', 'parent_id')) {
                $table->uuid('parent_id')->nullable()->after('lampiran_id');

                // Tambahkan foreign key
                $table->foreign('parent_id')
                      ->references('id')
                      ->on('komentar')
                      ->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('komentar', function (Blueprint $table) {
            //
        });
    }
};