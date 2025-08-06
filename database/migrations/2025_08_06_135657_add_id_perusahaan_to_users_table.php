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
       Schema::table('users', function (Blueprint $table) {
        // Jika sebelumnya nullable, ubah menjadi tidak nullable
        $table->string('id_perusahaan', 36)->nullable()->after('email');
        $table->foreign('id_perusahaan')
              ->references('id')
              ->on('perusahaan')
              ->onDelete('cascade'); // atau set null jika ingin fleksibel
    });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['id_perusahaan']);
            $table->dropColumn('id_perusahaan');
        });
    }
};
