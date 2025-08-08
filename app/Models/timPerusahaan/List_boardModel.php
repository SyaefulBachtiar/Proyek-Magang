<?php

namespace App\Models\timPerusahaan;

use Illuminate\Database\Eloquent\Model;

class List_boardController extends Model
{
    protected $table = 'list_board';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'urutan_posisi',
        'id_board'
    ];
}
