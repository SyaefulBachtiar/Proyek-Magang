<?php

namespace App\Models;

use App\Models\timPerusahaan\TimPerusahaan;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
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
        'image', // Kolom untuk menyimpan path logo
        'user_id',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }
    
    /**
     *
     * @return string
     */
    public function getLogoUrlAttribute()
    {
        if ($this->image && Storage::disk('public')->exists($this->image)) {
            return Storage::url($this->image);
        }

        return asset('img/default-company-logo.jpg');
    }


    // --- RELASI ---

    public function anggotaPerusahaan()
    {
        return $this->hasMany(Anggota_perusahaan::class, 'perusahaan_id', 'id');
    }

    public function timPerusahaan()
    {
        return $this->hasMany(TimPerusahaan::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
