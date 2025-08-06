<?php

namespace App\Models\timPerusahaan;

use App\Models\Perusahaan;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class TimPerusahaan extends Model
{
    protected $table = 'tim_perusahaan'; 
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'nama_tim',
        'deskripsi_tim',
        'user_id',
        'image',
        'jenis_tim',
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

    // relasi ke table perusahaan many to one
    public function perusahaan()
    {
        return $this->belongsTo(Perusahaan::class);
    }

    // relasi ke table anggota tim one to many
    public function anggota_tim_perusahaan()
    {
        return $this->hasMany(Anggota_tim::class, 'id_tim_perusahaan',);
    }

    // relasi ke table user one to one
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

}
