<?php

namespace App\Http\Controllers;

use App\Models\ProfilePerusahaan;
use App\Http\Requests\ProfilePerusahaanRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfilePerusahaanController extends Controller
{
    public function index()
    {
        $company = ProfilePerusahaan::getMainCompany();

        return Inertia::render('Pengaturan/ContentPengaturan', [
            'activePage' => 'pengaturan',
            'company' => [
                'id' => $company->id,
                'name' => $company->nama_perusahaan,
                'description' => $company->deskripsi,
                'logo' => $company->logo_url,
                'role' => $company->role_perusahaan,
                'perusahaan_id' => $company->perusahaan_id,
            ],
        ]);
    }

    public function show($id)
    {
        $company = ProfilePerusahaan::findOrFail($id);

        return Inertia::render('Pengaturan/ContentPengaturan', [
            'activePage' => 'pengaturan',
            'company' => [
                'id' => $company->id,
                'name' => $company->nama_perusahaan,
                'description' => $company->deskripsi,
                'logo' => $company->logo_url,
                'role' => $company->role_perusahaan,
                'perusahaan_id' => $company->perusahaan_id,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProfilePerusahaanRequest $request)
    {
        try {
            $data = $request->validated();
            
            // Pastikan perusahaan_id selalu ada
            if (!isset($data['perusahaan_id']) || empty($data['perusahaan_id'])) {
                $data['perusahaan_id'] = 1; // Default perusahaan_id
            }
            
            // Handle upload foto jika ada
            if ($request->hasFile('foto_profile_perusahaan')) {
                $tempCompany = new ProfilePerusahaan();
                $logoPath = $tempCompany->uploadLogo($request->file('foto_profile_perusahaan'));
                $data['foto_profile_perusahaan'] = $logoPath;
            }
            
            $company = ProfilePerusahaan::create($data);
            
            return back()->with('success', 'Data perusahaan berhasil dibuat.');
            
        } catch (\Exception $e) {
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProfilePerusahaanRequest $request, $id = null)
    {
        try {
            if ($id) {
                $company = ProfilePerusahaan::findOrFail($id);
            } else {
                $company = ProfilePerusahaan::getMainCompany();
            }

            $data = $request->validated();

            // Handle upload foto jika ada
            if ($request->hasFile('foto_profile_perusahaan')) {
                $logoPath = $company->uploadLogo($request->file('foto_profile_perusahaan'));
                $data['foto_profile_perusahaan'] = $logoPath;
            }

            // Pastikan perusahaan_id tidak kosong saat update
            if (!isset($data['perusahaan_id']) || empty($data['perusahaan_id'])) {
                $data['perusahaan_id'] = $company->perusahaan_id ?: 1;
            }

            // Update data
            $company->fill($data);
            $company->save();

            return back()->with('success', 'Data perusahaan berhasil diperbarui.');

        } catch (\Exception $e) {
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Update khusus untuk data dari frontend React
     */
    public function updateFromFrontend(Request $request, $id = null)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
        ]);

        try {
            if ($id) {
                $company = ProfilePerusahaan::findOrFail($id);
            } else {
                $company = ProfilePerusahaan::getMainCompany();
            }

            // Map data dari frontend ke format model
            $company->nama_perusahaan = $request->name;
            $company->deskripsi = $request->description;
            
            // Pastikan perusahaan_id tidak hilang
            if (!$company->perusahaan_id) {
                $company->perusahaan_id = 1;
            }
            
            $company->save();

            return response()->json([
                'success' => true,
                'message' => 'Data perusahaan berhasil diperbarui.',
                'data' => [
                    'id' => $company->id,
                    'name' => $company->nama_perusahaan,
                    'description' => $company->deskripsi,
                    'logo' => $company->logo_url,
                    'perusahaan_id' => $company->perusahaan_id,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload logo perusahaan
     */
    public function uploadLogo(Request $request, $id = null)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
        ]);

        try {
            if ($id) {
                $company = ProfilePerusahaan::findOrFail($id);
            } else {
                $company = ProfilePerusahaan::getMainCompany();
            }

            $logoPath = $company->uploadLogo($request->file('logo'));

            return response()->json([
                'success' => true,
                'message' => 'Logo berhasil diupload.',
                'logo_url' => $company->logo_url
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * API Methods
     */
    public function apiIndex()
    {
        $companies = ProfilePerusahaan::with('perusahaan')->get();
        
        return response()->json([
            'success' => true,
            'data' => $companies->map(function($company) {
                return [
                    'id' => $company->id,
                    'name' => $company->nama_perusahaan,
                    'description' => $company->deskripsi,
                    'logo_url' => $company->logo_url,
                    'role' => $company->role_perusahaan,
                    'perusahaan_id' => $company->perusahaan_id,
                    'perusahaan' => $company->perusahaan,
                ];
            })
        ]);
    }

    public function apiShow($id)
    {
        $company = ProfilePerusahaan::with('perusahaan')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $company->id,
                'name' => $company->nama_perusahaan,
                'description' => $company->deskripsi,
                'logo_url' => $company->logo_url,
                'role' => $company->role_perusahaan,
                'perusahaan_id' => $company->perusahaan_id,
                'perusahaan' => $company->perusahaan,
                'updated_at' => $company->updated_at->format('Y-m-d H:i:s'),
            ]
        ]);
    }

    /**
     * API Store method
     */
    public function apiStore(Request $request)
    {
        $request->validate([
            'nama_perusahaan' => 'required|string|max:255',
            'deskripsi' => 'nullable|string|max:2000',
            'role_perusahaan' => 'required|string|in:main,branch,subsidiary',
            'perusahaan_id' => 'nullable|exists:perusahaan,id',
            'foto_profile_perusahaan' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
        ]);

        try {
            $data = $request->all();
            
            // Pastikan perusahaan_id ada
            if (!isset($data['perusahaan_id']) || empty($data['perusahaan_id'])) {
                $data['perusahaan_id'] = 1;
            }
            
            // Handle upload foto
            if ($request->hasFile('foto_profile_perusahaan')) {
                $tempCompany = new ProfilePerusahaan();
                $logoPath = $tempCompany->uploadLogo($request->file('foto_profile_perusahaan'));
                $data['foto_profile_perusahaan'] = $logoPath;
            }
            
            $company = ProfilePerusahaan::create($data);
            
            return response()->json([
                'success' => true,
                'message' => 'Profile perusahaan berhasil dibuat.',
                'data' => [
                    'id' => $company->id,
                    'name' => $company->nama_perusahaan,
                    'description' => $company->deskripsi,
                    'logo_url' => $company->logo_url,
                    'role' => $company->role_perusahaan,
                    'perusahaan_id' => $company->perusahaan_id,
                ]
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $company = ProfilePerusahaan::findOrFail($id);
            
            // Cek apakah ini main company
            if ($company->role_perusahaan === 'main') {
                return back()->with('error', 'Main company tidak dapat dihapus.');
            }
            
            $company->delete();
            
            return back()->with('success', 'Profile perusahaan berhasil dihapus.');
            
        } catch (\Exception $e) {
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}