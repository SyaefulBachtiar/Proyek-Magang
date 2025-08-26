<?php

namespace App\Models\timPerusahaan;

use Illuminate\Database\Eloquent\Model;

class Label_card extends Model
{
    protected $table = 'label_card';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'warna',
        'title',
        'id_card',
        'id_label_tim'
    ];

    public function card () {
        return $this->belongsTo(Card_listModel::class, 'id_card', 'id');
    }

    public function label_tim () {
        return $this->belongsTo(Label_tim::class, 'id_label_tim', 'id');
    }
}
