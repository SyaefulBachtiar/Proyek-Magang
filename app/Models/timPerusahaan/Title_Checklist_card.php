<?php

namespace App\Models\TimPerusahaan;

use App\Models\timPerusahaan\Card_listModel;
use App\Models\timPerusahaan\TimPerusahaan;
use App\Models\timPerusahaan\Title_Checklist;
use Illuminate\Database\Eloquent\Model;

class Title_Checklist_card extends Model
{
    protected $table = 'title_checklist_card';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'title',
        'id_card',
        'id_tim',
        'id_title_checklist'
    ];

    public function card () {
        return $this->belongsTo(Card_listModel::class, 'id_card', 'id');
    }

    public function checklist_card () {
        return $this->hasMany(Checklist_card::class, 'id_title_checklist_card');
    }

    public function tim_perusahaan () {
        return $this->belongsTo(TimPerusahaan::class, 'id_tim', 'id');
    }

    public function title_checklist () {
        return $this->belongsTo(Title_Checklist::class, 'id_title_checklist', 'id');
    }
}
