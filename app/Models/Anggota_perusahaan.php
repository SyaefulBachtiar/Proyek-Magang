<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Anggota_perusahaan extends Model
{
    protected $table = "anggota_perusahaan";

    public $incrementing = false;

    protected $keyType = "string";

    protected $fillable = [
        'id',
        'role',
        'jabatan',
        'perusahaan_id',
        'user_id',
    ];

    public function user () {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function perusahaan () {
        return $this->belongsTo(Perusahaan::class, 'perusahaan_id', 'id');
    }
}
