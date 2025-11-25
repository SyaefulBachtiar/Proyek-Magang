<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Cek apakah admin sudah ada untuk menghindari duplikasi
        if (!User::where('email', 'admin@platform.com')->exists()) {
            User::create([
                'id' => strtoupper(Str::uuid()),
                'name' => 'Administrator Utama',
                'email' => 'admin@platform.com',
                'password' => Hash::make('password123'), // Password default
                'is_admin' => true,
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
        }
    }
}