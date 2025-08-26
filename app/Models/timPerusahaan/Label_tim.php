<?php

namespace App\Models\timPerusahaan;

use Illuminate\Database\Eloquent\Model;

class Label_tim extends Model
{
    protected $table = 'label_tim';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    public $fillable = [
        'id',
        'warna',
        'title',
        'id_tim_perusahaan',
    ];

    public function tim_perusahaan () {
        return $this->belongsTo(TimPerusahaan::class, 'id_tim_perusahaan', 'id');
    }

    public function label_card () {
        return $this->hasMany(Label_card::class, 'id_label_tim', 'id');
    }
    
}
