<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ProfilePerusahaan extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'nama_perusahaan',
        'foto_profile_perusahaan',
        'deskripsi',
        'role_perusahaan',
        'perusahaan_id',
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

    // relasi ke table perusahaan one to one
    public function perusahaan() {
        return $this->belongsTo(Perusahaan::class, 'perusahaan_id');
    }
}
