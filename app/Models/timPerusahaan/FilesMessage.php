<?php

namespace App\Models\TimPerusahaan;

use Illuminate\Database\Eloquent\Model;

class FilesMessage extends Model
{
    protected $table = 'files_message';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'id_message',
        'file'
    ];

    public function message () {
        return $this->belongsTo(Messages::class, 'id_message', 'id');
    }
}
