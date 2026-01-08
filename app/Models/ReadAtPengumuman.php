<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReadAtPengumuman extends Model
{
    protected $table = 'read_at_pengumuman';
    
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = ['id', 'id_pengumuman', 'id_user_read'];
}