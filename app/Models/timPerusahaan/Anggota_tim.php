<?php

namespace App\Models\timPerusahaan;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Anggota_tim extends Model
{
    protected $table = 'anggota_tim'; 
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'id_users',
        'id_tim_perusahaan',
        'role_anggota'
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

    // relasi ke table Tim perusahaan 
   public function tim()
    {
        return $this->belongsTo(TimPerusahaan::class);
    }

    // relasi ke table user
    public function user()
    {
        return $this->belongsTo(User::class, 'id_users');
    }

    public function anggota_card () {
        return $this->hasMany(Anggota_card::class, 'id_anggota_tim', 'id');
    }

}
