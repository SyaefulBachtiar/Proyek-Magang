<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Models\timPerusahaan\Anggota_card;
use App\Models\timPerusahaan\Anggota_tim;
use App\Models\timPerusahaan\Card_listModel;
use App\Models\TimPerusahaan\Komentar;
use App\Models\TimPerusahaan\Messages;
use App\Models\timPerusahaan\Notifikasi;
use App\Models\TimPerusahaan\ReadAtMessage;
use App\Models\timPerusahaan\TimPerusahaan;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    public $incrementing = false;
    protected $keyType = 'string'; 
    protected $primaryKey = 'id'; 
    protected $fillable = [
        'name',
        'email',
        'password',
        'bio_profile',
        'poto_profile_user',
        'nama_perusahaan',
        'remember_token',
        'is_online',
        'last_seen'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

     protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            // Jika belum ada ID, generate ID random
            if (empty($model->id)) {
                $model->id = strtoupper(Str::uuid()); // contoh: A1B2C3D4E5
                // bisa juga pakai UUID: $model->id = (string) Str::uuid();
            }
        });
    }

    // relasi ke table perusahaan
    public function perusahaan () {
        return $this->hasOne(Perusahaan::class, 'user_id', 'id');
    }

    public function anggotaPerusahaan () {
        return $this->hasOne(Anggota_perusahaan::class, 'user_id', 'id');
    }

    // relasi ke table anggota tim
    public function anggota_tim()
    {
        return $this->hasOne(Anggota_tim::class, 'id_users', 'id');
    }

    // relasi ke table tim perusahaan
    public function tim_perusahaan() 
    {
         return $this->belongsToMany(
        TimPerusahaan::class,
        'anggota_tim',
        'id_users',
        'id_tim_perusahaan'
    );
    }

    public function anggota_card () {
        return $this->hasMany(Anggota_card::class, 'id_user', 'id');
    }

    public function isOnline()
    {
        // Cek cache terlebih dahulu
        if (Cache::has('user-is-online-' . $this->id)) {
            return true;
        }
        
        // Fallback ke database jika perlu
        return $this->is_online == true;
    }
    
    public function notifikasi () {
        return $this->hasMany(Notifikasi::class, 'user_id', 'id');
    }

    public function komentar () {
        return $this->hasMany(Komentar::class, 'id_user', 'id');
    }

    public function message () {
        return $this->hasMany(Messages::class, 'sender_id', 'id');
    }

    public function read () {
        return $this->hasMany(ReadAtMessage::class, 'id_user_read', 'id');
    }
}
