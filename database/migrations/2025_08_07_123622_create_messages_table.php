<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMessagesTable extends Migration
{
    public function up()
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('dashboard_id'); // untuk grup berdasarkan dashboard/proyek
            $table->text('message');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            // Asumsikan ada tabel dashboards atau projects
            // $table->foreign('dashboard_id')->references('id')->on('dashboards')->onDelete('cascade');
            
            $table->index(['dashboard_id', 'created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('messages');
    }
}