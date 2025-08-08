<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Models\timPerusahaan\Anggota_tim;
use App\Models\timPerusahaan\TimPerusahaan;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
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
        return $this->hasOne(Perusahaan::class);
    }

    // relasi ke table anggota tim
    public function anggota_tim()
    {
        return $this->hasMany(Anggota_tim::class, 'id_users', 'id');
    }

    // relasi ke table tim perusahaan
    public function tim_perusahaan() 
    {
        return $this->hasMany(TimPerusahaan::class, 'user_id', 'id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
    
}
