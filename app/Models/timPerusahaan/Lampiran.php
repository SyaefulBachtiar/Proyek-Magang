<?php

namespace App\Models\TimPerusahaan;

use App\Models\TimPerusahaan\Komentar;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lampiran extends Model
{
    use HasFactory;

    /**
     * Nama tabel yang terkait dengan model ini.
     *
     * @var string
     */
    protected $table = 'lampiran';

    /**
     * Menunjukkan bahwa ID model bukan auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * Tipe data dari primary key.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Atribut yang dapat diisi secara massal.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'judul',
        'deskripsi',
        'image',
        'id_card',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'id' => 'string',
        'id_card' => 'string',
    ];

    /**
     * Mendefinisikan relasi "belongsTo" ke model Card_listModel.
     * Setiap lampiran dimiliki oleh satu kartu (card).
     */
    public function card(): BelongsTo
    {
        // Pastikan path ke model Card_listModel sudah benar
        // Sesuai proyek Anda, model ini berada di namespace App\Models\timPerusahaan
        return $this->belongsTo(\App\Models\timPerusahaan\Card_listModel::class, 'id_card', 'id');
    }

    public function komentar () {
        return $this->hasMany(Komentar::class, 'lampiran_id', 'id');
    }
}