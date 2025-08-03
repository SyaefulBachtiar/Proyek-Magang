<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Perusahaan extends Model
{
    protected $table = 'perusahaan'; 
    
    protected $fillable = [
        'role',
        'jabatan',
        'user_id',
    ];

    public function user () {
        return $this->belongsTo(User::class);
    }
}
