<?php

namespace App\Models\TimPerusahaan;

use App\Models\timPerusahaan\Card_listModel;
use App\Models\timPerusahaan\Checklist;
use Illuminate\Database\Eloquent\Model;

class Checklist_card extends Model
{
    protected $table = 'checklist_card';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'title',
        'image',
        'id_card',
        'id_title_checklist_card',
        'is_checked'
    ];

    public function card() {
        return $this->belongsTo(Card_listModel::class, 'id_card', 'id');
    }

    public function title_checklist_card () {
        return $this->belongsTo(Title_Checklist_card::class, 'id_title_checklist_card', 'id');
    }

    public function checklist () {
        return $this->hasOne(Checklist::class, 'id_checklist_card', 'id');
    }
}
