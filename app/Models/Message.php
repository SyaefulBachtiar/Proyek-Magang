<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tim_perusahaan_id',
        'message'
    ];

    protected $with = ['user']; // Eager load user otomatis

    /**
     * Relasi ke User (pengirim pesan)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke Tim Perusahaan (grup chat)
     */
    public function timPerusahaan()
    {
        return $this->belongsTo(TimPerusahaan::class);
    }

    /**
     * Scope untuk ambil pesan berdasarkan tim
     */
    public function scopeByTim($query, $timId)
    {
        return $query->where('tim_perusahaan_id', $timId);
    }

    /**
     * Scope untuk ambil pesan terbaru
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Scope untuk ambil pesan lama ke baru
     */
    public function scopeOldest($query)
    {
        return $query->orderBy('created_at', 'asc');
    }
}