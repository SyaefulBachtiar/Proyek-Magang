<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ProfilePerusahaan;
use App\Models\Perusahaan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class PengaturanController extends Controller
{
    /**
     * Tampilkan halaman pengaturan
     */
    public function index()
    {
        try {
            // Get profile perusahaan untuk user yang sedang login
            $profilePerusahaan = ProfilePerusahaan::getMainCompanyForUser();
            
            Log::info('PengaturanController index called', [
                'user_id' => Auth::id(),
                'company_found' => !!$profilePerusahaan,
                'company_id' => $profilePerusahaan->id ?? null
            ]);
            
            if (!$profilePerusahaan) {
                return Inertia::render('pageDashboard/ContentPengaturan', [
                    'activePage' => 'pengaturan',
                    'company' => null,
                    'flash' => [
                        'error' => 'Data perusahaan tidak ditemukan. Silakan hubungi administrator.'
                    ]
                ]);
            }

            // Load relasi perusahaan
            $profilePerusahaan->load('perusahaan');

            return Inertia::render('pageDashboard/ContentPengaturan', [
                'activePage' => 'pengaturan',
                'company' => $profilePerusahaan->getFormattedData(),
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error')
                ],
                'errors' => session('errors') ? session('errors')->getBag('default') : []
            ]);

        } catch (\Exception $e) {
            Log::error('Error in pengaturan index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id() ?? 'guest'
            ]);
            
            return Inertia::render('pageDashboard/ContentPengaturan', [
                'activePage' => 'pengaturan',
                'company' => null,
                'flash' => [
                    'error' => 'Terjadi kesalahan saat memuat data pengaturan.'
                ]
            ]);
        }
    }

    /**
     * Update data perusahaan via frontend
     */
    public function updateFrontend(Request $request)
    {
        try {
            // Debug: log semua data yang diterima
            Log::info('PengaturanController updateFrontend called', [
                'all_data' => $request->all(),
                'files' => array_keys($request->allFiles()),
                'user_id' => Auth::id()
            ]);

            // Validasi input (logo menjadi optional)
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|min:2|max:100',
                'description' => 'nullable|string|max:1000',
                'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // Logo optional
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed in updateFrontend', [
                    'errors' => $validator->errors()->toArray(),
                    'request_data' => $request->except(['logo'])
                ]);
                
                return back()->withErrors($validator)->withInput()->with('flash', [
                    'error' => 'Data yang dimasukkan tidak valid.'
                ]);
            }

            Log::info('Validation passed', ['validated_data' => $validator->validated()]);

            // Get profile perusahaan
            $profilePerusahaan = ProfilePerusahaan::getMainCompanyForUser();
            
            if (!$profilePerusahaan) {
                Log::error('Company not found for user', ['user_id' => Auth::id()]);
                return back()->with('flash', [
                    'error' => 'Data perusahaan tidak ditemukan.'
                ]);
            }

            Log::info('Company found', [
                'company_id' => $profilePerusahaan->id,
                'current_name' => $profilePerusahaan->nama_perusahaan ?? 'null',
                'current_description' => $profilePerusahaan->deskripsi ?? 'null'
            ]);

            // Update nama perusahaan (di tabel perusahaan)
            $updateNameResult = $profilePerusahaan->updateNamaPerusahaan($request->name);
            Log::info('Name update result', $updateNameResult);
            
            if (!$updateNameResult['success']) {
                return back()->with('flash', [
                    'error' => $updateNameResult['message']
                ]);
            }

            // Update deskripsi (di tabel profile_perusahaan)
            $updateProfileResult = $profilePerusahaan->updateProfileData([
                'deskripsi' => $request->description,
            ]);
            Log::info('Profile update result', $updateProfileResult);

            if (!$updateProfileResult['success']) {
                return back()->with('flash', [
                    'error' => $updateProfileResult['message']
                ]);
            }

            // Upload logo jika ada file logo baru
            if ($request->hasFile('logo')) {
                Log::info('Logo file detected, starting upload');
                $logoResult = $profilePerusahaan->uploadLogo($request->file('logo'));
                Log::info('Logo upload result', $logoResult);
                
                if (!$logoResult['success']) {
                    Log::warning('Logo upload failed but other data updated', [
                        'error' => $logoResult['message'],
                        'company_id' => $profilePerusahaan->id
                    ]);
                    // Don't fail the entire operation just because logo failed
                }
            }

            // Refresh company data untuk memastikan perubahan tersimpan
            $profilePerusahaan->refresh();
            Log::info('Final company data after update', [
                'id' => $profilePerusahaan->id,
                'name' => $profilePerusahaan->nama_perusahaan ?? 'null',
                'description' => $profilePerusahaan->deskripsi ?? 'null'
            ]);

            return back()->with('flash', [
                'success' => 'Data perusahaan berhasil diperbarui.'
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating company data in PengaturanController', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['logo']),
                'user_id' => Auth::id() ?? 'guest'
            ]);
            
            return back()->with('flash', [
                'error' => 'Terjadi kesalahan saat menyimpan data.'
            ]);
        }
    }

    /**
     * Upload logo perusahaan
     */
    public function uploadLogo(Request $request)
    {
        try {
            Log::info('PengaturanController uploadLogo called', [
                'user_id' => Auth::id(),
                'has_file' => $request->hasFile('logo')
            ]);

            // Validasi file
            $validator = Validator::make($request->all(), [
                'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'File tidak valid. Gunakan format JPEG, PNG, JPG, GIF, atau SVG dengan ukuran maksimal 2MB.',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get profile perusahaan
            $profilePerusahaan = ProfilePerusahaan::getMainCompanyForUser();
            
            if (!$profilePerusahaan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data perusahaan tidak ditemukan.'
                ], 404);
            }

            // Upload logo
            $uploadResult = $profilePerusahaan->uploadLogo($request->file('logo'));
            Log::info('Logo upload result in PengaturanController', $uploadResult);

            if ($uploadResult['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'Logo berhasil diupload.',
                    'logo_url' => $uploadResult['url']
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => $uploadResult['message']
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Error uploading logo in PengaturanController', [
                'message' => $e->getMessage(),
                'user_id' => Auth::id() ?? 'guest'
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengupload logo.'
            ], 500);
        }
    }

    /**
     * Update profile lengkap (alamat, telepon, dll)
     */
    public function updateProfile(Request $request)
    {
        try {
            Log::info('PengaturanController updateProfile called', [
                'request_data' => $request->except(['logo']),
                'user_id' => Auth::id()
            ]);

            // Validasi input
            $validator = Validator::make($request->all(), [
                'nama_perusahaan' => 'required|string|min:2|max:100',
                'deskripsi' => 'nullable|string|max:1000',
                'alamat' => 'nullable|string|max:255',
                'telepon' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'website' => 'nullable|url|max:255',
                'social_media' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed in updateProfile', [
                    'errors' => $validator->errors()->toArray()
                ]);
                return back()->withErrors($validator)->withInput();
            }

            // Get profile perusahaan
            $profilePerusahaan = ProfilePerusahaan::getMainCompanyForUser();
            
            if (!$profilePerusahaan) {
                Log::error('Company not found in updateProfile', ['user_id' => Auth::id()]);
                return back()->with('flash', [
                    'error' => 'Data perusahaan tidak ditemukan.'
                ]);
            }

            // Update nama perusahaan
            $updateNameResult = $profilePerusahaan->updateNamaPerusahaan($request->nama_perusahaan);
            Log::info('Name update result in updateProfile', $updateNameResult);
            
            if (!$updateNameResult['success']) {
                return back()->with('flash', [
                    'error' => $updateNameResult['message']
                ]);
            }

            // Update profile data
            $updateProfileResult = $profilePerusahaan->updateProfileData([
                'deskripsi' => $request->deskripsi,
                'alamat' => $request->alamat,
                'telepon' => $request->telepon,
                'email' => $request->email,
                'website' => $request->website,
                'social_media' => $request->social_media,
            ]);
            Log::info('Profile update result in updateProfile', $updateProfileResult);

            if (!$updateProfileResult['success']) {
                return back()->with('flash', [
                    'error' => $updateProfileResult['message']
                ]);
            }

            return back()->with('flash', [
                'success' => 'Profil perusahaan berhasil diperbarui.'
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating profile in PengaturanController', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id() ?? 'guest'
            ]);
            
            return back()->with('flash', [
                'error' => 'Terjadi kesalahan saat menyimpan profil.'
            ]);
        }
    }
}