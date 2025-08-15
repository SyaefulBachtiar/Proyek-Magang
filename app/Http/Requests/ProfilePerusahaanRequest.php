<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProfilePerusahaanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Sesuaikan dengan logic authorization Anda
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'nama_perusahaan' => 'required|string|max:255',
            'deskripsi' => 'nullable|string|max:2000',
            'role_perusahaan' => 'required|string|in:main,branch,subsidiary',
            'perusahaan_id' => 'nullable|exists:perusahaan,id',
            'foto_profile_perusahaan' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nama_perusahaan.required' => 'Nama perusahaan harus diisi.',
            'nama_perusahaan.max' => 'Nama perusahaan maksimal 255 karakter.',
            'deskripsi.max' => 'Deskripsi maksimal 2000 karakter.',
            'role_perusahaan.required' => 'Role perusahaan harus diisi.',
            'role_perusahaan.in' => 'Role perusahaan harus salah satu dari: main, branch, subsidiary.',
            'perusahaan_id.exists' => 'Perusahaan yang dipilih tidak valid.',
            'foto_profile_perusahaan.image' => 'File harus berupa gambar.',
            'foto_profile_perusahaan.mimes' => 'Format gambar harus: jpeg, png, jpg, gif, atau svg.',
            'foto_profile_perusahaan.max' => 'Ukuran gambar maksimal 2MB.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default perusahaan_id jika tidak ada
        if (!$this->has('perusahaan_id') || empty($this->perusahaan_id)) {
            $this->merge([
                'perusahaan_id' => 1
            ]);
        }
        
        // Set default role jika tidak ada
        if (!$this->has('role_perusahaan') || empty($this->role_perusahaan)) {
            $this->merge([
                'role_perusahaan' => 'main'
            ]);
        }
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'nama_perusahaan' => 'nama perusahaan',
            'deskripsi' => 'deskripsi',
            'role_perusahaan' => 'role perusahaan',
            'perusahaan_id' => 'ID perusahaan',
            'foto_profile_perusahaan' => 'foto profil perusahaan'
        ];
    }
}