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
            $table->string('parent_id', 36)->nullable()->after('lampiran_id');
            $table->foreign('parent_id')->references('id')->on('komentar')->onDelete('cascade');
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
