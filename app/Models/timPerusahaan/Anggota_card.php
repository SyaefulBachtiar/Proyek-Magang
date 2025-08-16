<?php

namespace App\Models\timPerusahaan;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Anggota_card extends Model
{
    protected $table = 'anggota_card';
    protected $keyType = 'string';
    public $primaryKey = 'id';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'id_user',
        'id_card',
    ];

    public function user () {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function cards () {
        return $this->belongsTo(Card_listModel::class, 'id_anggota_tim');
    }
}
