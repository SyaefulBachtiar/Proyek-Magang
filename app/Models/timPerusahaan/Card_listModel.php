<?php

namespace App\Models\timPerusahaan;

use Illuminate\Database\Eloquent\Model;

class Card_listModel extends Model
{
    protected $table = 'card_list';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'id',
        'nama_card',
        'pembuat',
        'image',
        'urutan',
        'id_list'
    ];

     public function listBoard()
    {
        return $this->belongsTo(List_boardModel::class, 'id_list', 'id');
    }

    public function anggota_card_list () {
        return $this->hasMany(Anggota_card::class, 'id_card');
    }
    
}
