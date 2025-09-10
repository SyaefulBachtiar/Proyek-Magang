<?php

namespace App\Models\TimPerusahaan;

use App\Models\timPerusahaan\TimPerusahaan;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Messages extends Model
{
    protected $table = 'messages';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'id_tim',
        'sender_id',
        'pesan',
    ];

    public function tim () {
        return $this->belongsTo(TimPerusahaan::class, 'id_tim', 'id');
    }

    public function sender () {
        return $this->belongsTo(User::class, 'sender_id', 'id');
    }

    public function read () {
        return $this->hasMany(ReadAtMessage::class, 'id_message', 'id');
    }

    public function file () {
        return $this->hasMany(FilesMessage::class, 'id_message', 'id');
    }
}
