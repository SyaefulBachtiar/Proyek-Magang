<?php

namespace App\Models\timPerusahaan;

use App\Models\TimPerusahaan\Title_Checklist_card;
use Illuminate\Database\Eloquent\Model;

class Title_Checklist extends Model
{
    protected $table = 'title_checklist';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'title',
        'id_tim_perusahaan',
        'id_card'
    ];

    public function tim_perusahaan () {
        return $this->belongsTo(TimPerusahaan::class, 'id_tim_perusahaan', 'id');
    }

    public function checklist () {
        return $this->hasMany(Checklist::class, 'id_title_checklist', 'id');
    }

    public function title_checklist_card () {
        return $this->hasMany(Title_Checklist_card::class, 'id_title_checklist', 'id');
    }
}
