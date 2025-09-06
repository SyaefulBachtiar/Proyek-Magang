<?php

namespace App\Models\timPerusahaan;

use App\Models\timPerusahaan\Card_listModel;
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
        'id_card'
    ];

    public function title_checklist () {
        return $this->belongsTo(Title_Checklist::class, 'id_title_checklist', 'id');
    }
}
