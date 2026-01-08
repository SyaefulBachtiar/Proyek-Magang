<?php

namespace App\Models;

use App\Models\TimPerusahaan\TimPerusahaan;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Pengumuman extends Model
{
    use HasFactory;

    protected $table = 'pengumuman';
    public $incrementing = false; 
    protected $keyType = 'string'; 

    protected $fillable = [
        'id', 
        'id_tim',
        'user_id',
        'judul',
        'isi',
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

    public function pembuat()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function tim()
    {
        return $this->belongsTo(TimPerusahaan::class, 'id_tim');
    }

    public function read()
    {
        return $this->hasMany(ReadAtPengumuman::class, 'id_pengumuman', 'id');
    }
}