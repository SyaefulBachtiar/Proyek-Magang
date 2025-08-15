<?php

namespace App\Models\timPerusahaan;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Anggota_card extends Model
{
    protected $table = 'anggota_card';
    protected $keyType = 'string';
    public $primaryKey = 'id';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'id_user',
        'id_tim_perusahaan',
        'id_anggota_tim'
    ];

    public function user () {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function tim_perusahaan () {
        return $this->belongsTo(TimPerusahaan::class, 'id_tim_perusahaan');
    }

    public function anggota_tim () {
        return $this->belongsTo(Anggota_tim::class, 'id_anggota_tim');
    }
}
