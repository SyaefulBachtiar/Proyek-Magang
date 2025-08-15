<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class ProfilePerusahaan extends Model
{
    protected $table = 'profile_perusahaan';
    
    protected $fillable = [
        'nama_perusahaan',
        'deskripsi',
        'role_perusahaan',
        'foto_profile_perusahaan',
        'perusahaan_id', // PASTIKAN INI ADA!
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Boot method to set default values
     */
    protected static function boot()
    {
        parent::boot();
        
        // Set default perusahaan_id saat creating
        static::creating(function ($model) {
            if (empty($model->perusahaan_id)) {
                $model->perusahaan_id = 1; // Default value
            }
            
            // Generate UUID jika tidak ada
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Relationship dengan tabel perusahaan
     */
    public function perusahaan(): BelongsTo
    {
        return $this->belongsTo(Perusahaan::class, 'perusahaan_id');
    }

    /**
     * Get main company - dengan safety check
     */
    public static function getMainCompany()
    {
        $company = self::where('role_perusahaan', 'main')->first();
        
        // Jika tidak ada main company, buat yang baru
        if (!$company) {
            $company = self::create([
                'nama_perusahaan' => 'BBPK Ciloto',
                'deskripsi' => 'Balai Besar Pelatihan Kesehatan Ciloto',
                'role_perusahaan' => 'main',
                'perusahaan_id' => 1, // WAJIB ADA!
            ]);
        }
        
        return $company;
    }

    /**
     * Get logo URL attribute
     */
    public function getLogoUrlAttribute()
    {
        if ($this->foto_profile_perusahaan) {
            return Storage::url($this->foto_profile_perusahaan);
        }
        
        return asset('images/default-company-logo.png');
    }

    /**
     * Upload logo method
     */
    public function uploadLogo(UploadedFile $file)
    {
        // Delete old logo if exists
        if ($this->foto_profile_perusahaan) {
            Storage::delete($this->foto_profile_perusahaan);
        }
        
        // Store new logo
        $path = $file->store('company-logos', 'public');
        
        // Update the model
        $this->foto_profile_perusahaan = $path;
        $this->save();
        
        return $path;
    }

    /**
     * Scope untuk main company
     */
    public function scopeMain($query)
    {
        return $query->where('role_perusahaan', 'main');
    }

    /**
     * Scope untuk branch company
     */
    public function scopeBranch($query)
    {
        return $query->where('role_perusahaan', 'branch');
    }

    /**
     * Get all companies with their relationships
     */
    public static function getAllWithRelations()
    {
        return self::with('perusahaan')->get();
    }

    /**
     * Create default main company if not exists
     */
    public static function ensureMainCompanyExists()
    {
        $mainCompany = self::where('role_perusahaan', 'main')->first();
        
        if (!$mainCompany) {
            return self::create([
                'nama_perusahaan' => 'BBPK Ciloto',
                'deskripsi' => 'Balai Besar Pelatihan Kesehatan Ciloto',
                'role_perusahaan' => 'main',
                'perusahaan_id' => 1,
            ]);
        }
        
        return $mainCompany;
    }

    /**
     * Delete logo when model is deleted
     */
    protected static function booted()
    {
        static::deleting(function ($model) {
            if ($model->foto_profile_perusahaan) {
                Storage::delete($model->foto_profile_perusahaan);
            }
        });
    }
}