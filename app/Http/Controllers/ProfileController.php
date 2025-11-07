<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;



class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user()->load('perusahaan');
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'user' => $user,
        ]);
    }
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
         /** @var \App\Models\User $user */
        $user = Auth::user();
    logger($request->all());

        // Validasi input
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id)
            ],
            'bio_profile' => ['nullable', 'string', 'max:500'],
            'poto_profile_user' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'jabatan' => ['nullable', 'string', 'max:50'],
        ], [
            'name.required' => 'Nama wajib diisi.',
            'name.max' => 'Nama tidak boleh lebih dari 255 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan oleh pengguna lain.',
            'bio_profile.max' => 'Bio profil tidak boleh lebih dari 500 karakter.',
            'poto_profile_user.image' => 'File harus berupa gambar.',
            'poto_profile_user.mimes' => 'Gambar harus berformat: jpeg, png, jpg, gif.',
            'poto_profile_user.max' => 'Ukuran gambar tidak boleh lebih dari 2MB.',
            'jabatan.max' => 'Jabatan tidak boleh lebih dari 50 karakter.',
        ]);

        // Handle upload foto profil
        if ($request->hasFile('poto_profile_user')) {
            if ($user->poto_profile_user && Storage::disk('public')->exists($user->poto_profile_user)) {
                Storage::disk('public')->delete($user->poto_profile_user);
            }

            $path = $request->file('poto_profile_user')->store('profile-photos', 'public');
            $validated['poto_profile_user'] = $path;
        } else {
            unset($validated['poto_profile_user']);
        }

        $user->update($validated);

        if (isset($validated['jabatan'])) {
            $user->perusahaan()->updateOrCreate(
                ['user_id' => $user->id],
                ['jabatan' => $validated['jabatan']]
            );
        }

        return redirect()->back()->with('message', 'Profil berhasil diperbarui!');
    }


    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
