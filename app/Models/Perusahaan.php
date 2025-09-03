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

    /**
     * Boot method untuk generate UUID secara otomatis.
     */
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
     * Accessor untuk mendapatkan URL logo perusahaan.
     * Ini akan secara otomatis membuat URL lengkap ke file logo.
     * Jika tidak ada logo, akan mengembalikan gambar default.
     *
     * @return string
     */
    public function getLogoUrlAttribute()
    {
        if ($this->image && Storage::disk('public')->exists($this->image)) {
            // Jika ada file logo, kembalikan URL-nya dari storage
            return Storage::url($this->image);
        }

        // Jika tidak ada, kembalikan path ke logo default
        return asset('images/default-company-logo.png');
    }


    // --- RELASI ---

    public function anggotaPerusahaan()
    {
        return $this->hasOne(Anggota_perusahaan::class, 'perusahaan_id', 'id');
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
