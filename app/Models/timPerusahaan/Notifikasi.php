<?php

namespace App\Models\TimPerusahaan;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Notifikasi extends Model
{
    protected $table = 'notifikasi';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id', 'user_id', 'title', 'message', 'type', 'is_read'
    ];

    public function user () {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
