<?php

namespace App\Models\TimPerusahaan;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ReadAtMessage extends Model
{
    protected $table = 'read_at_mesaage';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'id_message',
        'id_user_read',
    ];

    public function message () {
        return $this->belongsTo(Messages::class, 'id_message', 'id');
    }

    public function user () {
        return $this->belongsTo(User::class, 'id_user_read', 'id');
    }
}
