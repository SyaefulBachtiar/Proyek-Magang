<?php

namespace App\Models\TimPerusahaan;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder; 

class Card_listModel extends Model
{
    protected $table = 'card_list';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'nama_card',
        'pembuat',
        'image',
        'urutan',
        'id_list',
        'archived_at' 
    ];

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::addGlobalScope('active', function (Builder $builder) {
            $builder->whereNull('archived_at');
        });
    }

    /**
     * Scope a query to only include archived cards.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeArchived($query)
    {
        return $query->withoutGlobalScope('active')->whereNotNull('archived_at');
    }

    // RELASI-RELASI
    public function listBoard()
    {
        return $this->belongsTo(List_boardModel::class, 'id_list', 'id');
    }

    public function anggota_card_list()
    {
        return $this->hasMany(Anggota_card::class, 'id_card', 'id');
    }

    public function kalender()
    {
        return $this->hasOne(Kalender::class, 'id_card', 'id');
    }

    public function label_card()
    {
        return $this->hasMany(Label_card::class, 'id_card', 'id');
    }

    public function title_checklist_card()
    {
        return $this->hasMany(Title_Checklist_card::class, 'id_card', 'id');
    }

    public function checklist_card()
    {
        return $this->hasMany(Checklist_card::class, 'id_card', 'id');
    }
    
    public function lampiran()
    {
        return $this->hasMany(Lampiran::class, 'id_card', 'id');
    }

    public function deskripsi()
    {
        return $this->hasOne(Deskripsi::class, 'id_card', 'id');
    }

    public function komentar()
    {
        return $this->hasMany(Komentar::class, 'id_card', 'id');
    }
}