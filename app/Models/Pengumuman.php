<?php

namespace App\Models;

use App\Models\timPerusahaan\TimPerusahaan;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengumuman extends Model
{
    use HasFactory;

    /**
     * Menentukan nama tabel yang digunakan oleh model ini.
     */
    protected $table = 'pengumuman';

    /**
     * Atribut yang boleh diisi secara massal (mass assignable).
     */
    protected $fillable = [
        'id_tim',
        'user_id',
        'judul',
        'isi',
    ];

    /**
     * Mendefinisikan relasi "belongsTo" ke model User.
     * Ini untuk mengambil data pembuat pengumuman.
     */
    public function pembuat()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Mendefinisikan relasi "belongsTo" ke model TimPerusahaan.
     * Ini untuk mengambil data tim terkait.
     */
    public function tim()
    {
        return $this->belongsTo(TimPerusahaan::class, 'id_tim');
    }
}