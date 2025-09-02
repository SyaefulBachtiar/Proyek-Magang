<?php

namespace App\Models;

use App\Models\timPerusahaan\TimPerusahaan;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Perusahaan extends Model
{
    protected $table = 'perusahaan'; 
    public $incrementing = false;
    protected $keyType = 'string'; 
    
    protected $fillable = [
        'id',
        'nama_perusahaan',
        'deskripsi',
        'image',
        'user_id',
    ];

    // generate id secara otomatis saat membuat model
     protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            // Jika belum ada ID, generate ID random
            if (empty($model->id)) {
                $model->id = strtoupper(Str::uuid()); // contoh: A1B2C3D4E5
                // bisa juga pakai UUID: $model->id = (string) Str::uuid();
            }
        });
    }

    // relasi ke table angota perusahaan one to many
    public function anggotaPerusahaan () {
        return $this->hasOne(Anggota_perusahaan::class, 'perusahaan_id', 'id');
    }

    // relasi ke table tim perusahaan one to many
    public function timPerusahaan() {
        return $this->hasMany(TimPerusahaan::class);
    }

    public function user () {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

}
