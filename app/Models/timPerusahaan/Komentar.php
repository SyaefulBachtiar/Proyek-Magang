<?php

namespace App\Models\TimPerusahaan;

use App\Models\timPerusahaan\Card_listModel;
use App\Models\timPerusahaan\Lampiran;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Komentar extends Model
{
    protected $table = 'komentar';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'mention',
        'komentar',
        'lampiran_id',
        'id_user',
        'id_card',
        'parent_id'
    ];

    public function user () {
        return $this->belongsTo(User::class, 'id_user', 'id');
    }

    public function lampiran () {
        return $this->belongsTo(Lampiran::class, 'lampiran_id', 'id');
    }

    public function card () {
        return $this->belongsTo(Card_listModel::class, 'id_card', 'id');
    }
}
