<?php

namespace App\Models\TimPerusahaan;

use App\Models\timPerusahaan\Card_listModel;
use Illuminate\Database\Eloquent\Model;

class Deskripsi extends Model
{
    protected $table = 'deskripsi';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'deskripsi',
        'id_card',
    ];

    public function card () {
        return $this->belongsTo(Card_listModel::class, 'id_card', 'id');
    }
}
