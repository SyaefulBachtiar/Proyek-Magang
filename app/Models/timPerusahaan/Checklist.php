<?php

namespace App\Models\timPerusahaan;

use App\Models\timPerusahaan\Card_listModel;
use App\Models\TimPerusahaan\Checklist_card;
use Illuminate\Database\Eloquent\Model;

class Checklist extends Model
{
    protected $table = 'checklist';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'title',
        'image',
        'is_checked',
        'id_title_checklist',
        'id_card',
        'id_checklist_card'
    ];

    public function title_checklist () {
        return $this->belongsTo(Title_Checklist::class, 'id_title_checklist', 'id');
    }
    public function checklist_card () {
        return $this->belongsTo(Checklist_card::class, 'id_checklist_card', 'id');
    }
}
