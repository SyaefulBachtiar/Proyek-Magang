<?php

namespace App\Models\Undangan;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Undangan extends Model
{
    protected $table = 'undangan';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'email',
        'role',
        'nama_perusahaan',
    ];

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
}
