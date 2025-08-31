<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class ProfilePerusahaan extends Model
{
    protected $table = 'profile_perusahaan';

    // Primary key UUID
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'perusahaan_id',
        'deskripsi',
        'role_perusahaan',
        'foto_profile_perusahaan',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'logo_url',
        'nama_perusahaan',
    ];

    /**
     * Boot lifecycle
     */
    protected static function booted()
    {
        // UUID generate
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });

        // Delete logo saat profile dihapus
        static::deleting(function ($model) {
            if (
                $model->foto_profile_perusahaan &&
                !filter_var($model->foto_profile_perusahaan, FILTER_VALIDATE_URL) &&
                Storage::disk('public')->exists($model->foto_profile_perusahaan)
            ) {
                Storage::disk('public')->delete($model->foto_profile_perusahaan);
            }
        });
    }

    /**
     * Relasi ke Perusahaan
     */
    public function perusahaan(): BelongsTo
    {
        return $this->belongsTo(Perusahaan::class, 'perusahaan_id');
    }

    /**
     * Accessor nama perusahaan
     */
    public function getNamaPerusahaanAttribute(): string
    {
        return $this->perusahaan?->nama_perusahaan ?? 'Tidak ada nama';
    }

    /**
     * Accessor logo url
     */
    public function getLogoUrlAttribute(): string
    {
        if ($this->foto_profile_perusahaan) {
            if (filter_var($this->foto_profile_perusahaan, FILTER_VALIDATE_URL)) {
                return $this->foto_profile_perusahaan;
            }

            if (Storage::disk('public')->exists($this->foto_profile_perusahaan)) {
                return Storage::url($this->foto_profile_perusahaan);
            }
        }

        // default logo
        return "https://images.seeklogo.com/logo-png/44/1/kemenkes-logo-png_seeklogo-447836.png";
    }

    /**
     * Ambil perusahaan utama untuk user login
     */
    public static function getMainCompanyForUser($userId = null): ?self
    {
        try {
            $targetUserId = $userId ?? Auth::id();

            if (!$targetUserId) {
                Log::info('User not authenticated when getting main company');
                return null;
            }

            $perusahaan = Perusahaan::where('user_id', $targetUserId)->first();
            if (!$perusahaan) {
                Log::info("No company found for user ID: {$targetUserId}");
                return null;
            }

            $profile = self::where('perusahaan_id', $perusahaan->id)
                ->main()
                ->first();

            // kalau belum ada, buat otomatis
            if (!$profile) {
                $profile = self::create([
                    'perusahaan_id' => $perusahaan->id,
                    'deskripsi' => 'Deskripsi singkat tentang perusahaan.',
                    'role_perusahaan' => 'main',
                ]);
                Log::info("Created new main profile with ID: {$profile->id}");
            }

            return $profile;
        } catch (\Exception $e) {
            Log::error('Error getting main company for user: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Upload logo
     */
    public function uploadLogo(UploadedFile $file): array
    {
        try {
            Validator::make(['logo' => $file], [
                'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            ])->validate();

            if (
                $this->foto_profile_perusahaan &&
                !filter_var($this->foto_profile_perusahaan, FILTER_VALIDATE_URL) &&
                Storage::disk('public')->exists($this->foto_profile_perusahaan)
            ) {
                Storage::disk('public')->delete($this->foto_profile_perusahaan);
            }

            $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('company-logos', $filename, 'public');

            $this->update(['foto_profile_perusahaan' => $path]);

            return [
                'success' => true,
                'path' => $path,
                'url' => Storage::url($path),
            ];
        } catch (\Exception $e) {
            Log::error('Error uploading logo: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Gagal mengupload logo: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update profile data
     */
    public function updateProfileData(array $data): array
    {
        try {
            $validated = Validator::make($data, [
                'deskripsi' => 'nullable|string|max:1000'
            ])->validate();

            $this->fill($validated)->save();

            return [
                'success' => true,
                'data' => $this->fresh()->load('perusahaan'),
            ];
        } catch (\Exception $e) {
            Log::error('Error updating profile: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Gagal memperbarui data: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update nama perusahaan via relasi
     */
    public function updateNamaPerusahaan(string $namaPerusahaan): array
    {
        try {
            if ($this->perusahaan) {
                $this->perusahaan->update(['nama_perusahaan' => $namaPerusahaan]);

                return [
                    'success' => true,
                    'message' => 'Nama perusahaan berhasil diperbarui',
                ];
            }

            return [
                'success' => false,
                'message' => 'Perusahaan tidak ditemukan',
            ];
        } catch (\Exception $e) {
            Log::error('Error updating company name: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Gagal memperbarui nama perusahaan',
            ];
        }
    }

    /**
     * Scope main & branch
     */
    public function scopeMain($query)
    {
        return $query->where('role_perusahaan', 'main');
    }

    public function scopeBranch($query)
    {
        return $query->where('role_perusahaan', 'branch');
    }

    /**
     * Format untuk frontend (ganti toArray → getFormattedData)
     */
    public function getFormattedData(): array
    {
        return [
            'id' => $this->id,
            'nama_perusahaan' => $this->nama_perusahaan,
            'deskripsi' => $this->deskripsi,
            'logo_url' => $this->logo_url,
        ];
    }
}
