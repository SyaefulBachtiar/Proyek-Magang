<?php

namespace App\Models\TimPerusahaan;

use Illuminate\Database\Eloquent\Model;

class Kalender extends Model
{
    protected $table = 'kalender';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'start_date',
        'due_date',
        'due_time',
        'reminder',
        'id_card'
    ];

    public function card () {
        return $this->belongsTo(Card_listModel::class, 'id_card', 'id');
    }


}
