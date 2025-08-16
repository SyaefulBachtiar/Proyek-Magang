<?php

// app/Models/Message.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\timPerusahaan\TimPerusahaan;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tim_id',
        'pesan',
        'is_read'
    ];

    // Relasi ke User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke Tim
    public function tim()
    {
        return $this->belongsTo(TimPerusahaan::class, 'tim_id');
    }

    // Format waktu untuk display
    public function getWaktuAttribute()
    {
        return $this->created_at->format('H:i');
    }

    // Format tanggal untuk display
    public function getTanggalAttribute()
    {
        return $this->created_at->format('d/m/Y');
    }
}