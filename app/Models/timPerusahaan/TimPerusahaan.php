<?php

namespace App\Models\TimPerusahaan;

use App\Models\Perusahaan;
use App\Models\Pengumuman;
use App\Models\TimPerusahaan\Messages;
use App\Models\TimPerusahaan\Title_Checklist;
use App\Models\TimPerusahaan\Title_Checklist_card;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class TimPerusahaan extends Model
{
    protected $table = 'tim_perusahaan';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'nama_tim',
        'deskripsi_tim',
        'user_id',
        'image',
        'jenis_tim',
        'perusahaan_id',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = strtoupper(Str::uuid());
            }
        });
    }

    public function perusahaan()
    {
        return $this->belongsTo(Perusahaan::class, 'perusahaan_id', 'id');
    }

    public function anggota_tim_perusahaan()
    {
        return $this->hasMany(Anggota_tim::class, 'id_tim_perusahaan', 'id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function label_tim()
    {
        return $this->hasMany(Label_tim::class, 'id_tim_perusahaan', 'id');
    }

    public function leader()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function board_tim()
    {
        return $this->hasOne(BoardModel::class, 'id_team', 'id');
    }

    public function title_checklist()
    {
        return $this->hasMany(Title_Checklist::class, 'id_tim_perusahaan', 'id');
    }

    public function title_checklist_card()
    {
        return $this->hasMany(Title_Checklist_card::class, 'id_tim', 'id');
    }

    public function messages()
    {
        return $this->hasMany(Messages::class, 'id_tim', 'id');
    }

    public function pengumuman()
    {
        return $this->hasMany(Pengumuman::class, 'id_tim', 'id');
    }

    public function scopeWithUnread($query, $userId)
    {
        return $query->withCount([
            'messages as unread_messages_count' => function ($q) use ($userId) {
                $q->whereDoesntHave('read', function ($subQ) use ($userId) {
                    $subQ->where('id_user_read', $userId);
                });
            },
            'pengumuman as unread_announcements_count' => function ($q) use ($userId) {
                $q->whereDoesntHave('read', function ($subQ) use ($userId) {
                    $subQ->where('id_user_read', $userId);
                });
            }
        ]);
    }
}