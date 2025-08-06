<?php

namespace App\Models\Undangan;

use Illuminate\Database\Eloquent\Model;

class Undangan extends Model
{
    protected $table = 'undangan';

    protected $fillable = [
        'email',
        'role',
        'id_perusahaan'
    ];
}
