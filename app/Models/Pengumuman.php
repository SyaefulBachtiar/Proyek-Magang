<?php

namespace App\Models;

use App\Models\timPerusahaan\TimPerusahaan;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengumuman extends Model
{
    use HasFactory;

    protected $table = 'pengumuman';

    protected $fillable = [
        'id_tim',
        'user_id',
        'judul',
        'isi',
    ];

    public function pembuat()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function tim()
    {
        return $this->belongsTo(TimPerusahaan::class, 'id_tim');
    }
}