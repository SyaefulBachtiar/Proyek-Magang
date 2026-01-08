<?php

namespace App\Models\TimPerusahaan;

use Illuminate\Database\Eloquent\Model;

class List_boardModel extends Model
{
    protected $with = ['cards'];
    protected $table = 'list_board';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'urutan_posisi',
        'judul',
        'id_board'
    ];

     public function cards()
    {
        return $this->hasMany(Card_listModel::class, 'id_list', 'id')
                    ->orderBy('urutan', 'asc');
    }

     public function board()
    {
        return $this->belongsTo(BoardModel::class, 'id_board', 'id');
    }
}
