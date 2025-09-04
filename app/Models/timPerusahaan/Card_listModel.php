<?php

namespace App\Models\timPerusahaan;

use App\Models\TimPerusahaan\Checklist;
use App\Models\TimPerusahaan\Checklist_card;
use App\Models\timPerusahaan\Title_Checklist_card;
use Illuminate\Database\Eloquent\Model;

class Card_listModel extends Model
{
    protected $table = 'card_list';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'id',
        'nama_card',
        'pembuat',
        'image',
        'urutan',
        'id_list'
    ];

     public function listBoard()
    {
        return $this->belongsTo(List_boardModel::class, 'id_list', 'id');
    }

    public function anggota_card_list () {
        return $this->hasMany(Anggota_card::class, 'id_card', 'id');
    }
    
    public function kalender () {
        return $this->hasMany(Kalender::class, 'id_card', 'id');
    }

    public function label_card () {
        return $this->hasMany(Label_card::class, 'id_card', 'id');
    }

    public function checklist () {
        return $this->hasMany(Checklist::class, 'id_card', 'id');
    }

    public function title_checklist () {
        return $this->hasMany(Title_Checklist::class, 'id_card', 'id');
    }

    public function title_checklist_card () {
        return $this->hasMany(Title_Checklist_card::class, 'id_card', 'id');
    }

    public function checklist_card () {
        return $this->hasMany(Checklist_card::class, 'id_card', 'id');
    }
}
