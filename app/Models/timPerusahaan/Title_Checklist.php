<?php

namespace App\Models\timPerusahaan;

use Illuminate\Database\Eloquent\Model;

class Title_Checklist extends Model
{
    protected $table = 'title_checklist';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'title',
        'id_tim_perusahaan'
    ];

    public function tim_perusahaan () {
        return $this->belongsTo(TimPerusahaan::class, 'id_tim_perusahaan', 'id');
    }

    public function checklist () {
        return $this->hasMany(Checklist::class, 'id_title_checklist', 'id');
    }
}
