<?php

namespace App\Models\timPerusahaan;

use Illuminate\Database\Eloquent\Model;

class BoardModel extends Model
{
    protected $table = 'board_tim';
    protected $primaryKey = 'id'; 
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'id_team'
    ];

   public function tim_perusahaan () {
        return $this->belongsTo(TimPerusahaan::class, 'id_team', 'id');
    }

     public function listBoards()
    {
        return $this->hasMany(List_boardModel::class, 'id_board', 'id');
    }
}
