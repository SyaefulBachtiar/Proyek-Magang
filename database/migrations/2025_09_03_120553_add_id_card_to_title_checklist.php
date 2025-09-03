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
        Schema::table('title_checklist', function (Blueprint $table) {
            $table->string('id_card', 36)->nullable()->after('id_tim_perusahaan');
            $table->foreign('id_card')->references('id')->on('card_list')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('title_checklist', function (Blueprint $table) {
            //
        });
    }
};
