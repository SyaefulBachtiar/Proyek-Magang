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
        if (!User::where('email', 'datinciloto@gmail.com')->exists()) {
            User::create([
                'id' => strtoupper(Str::uuid()),
                'name' => 'Administrator Utama',
                'email' => 'datinciloto@gmail.com',
                'password' => Hash::make('password123'),
                'is_admin' => true,
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
        }
    }
}