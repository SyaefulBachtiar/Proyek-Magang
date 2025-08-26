<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LabelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
     {
        // ambil id pertama dari tim_perusahaan & card_list
        $timId   = DB::table('tim_perusahaan')->value('id'); 
        $cardId  = DB::table('card_list')->value('id');      

        // jika tidak ada data, hentikan
        if (!$timId || !$cardId) {
            $this->command->warn('⚠️ Tidak ada data di tim_perusahaan atau card_list. Tambahkan dulu sebelum seed.');
            return;
        }

        // --- Seeder untuk label_tim (5 data) ---
        $labelTim = [
            ['warna' => '#FF0000', 'title' => 'Urgent'],
            ['warna' => '#00FF00', 'title' => 'Selesai'],
            ['warna' => '#0000FF', 'title' => 'In Progress'],
            ['warna' => '#FFA500', 'title' => 'Review'],
            ['warna' => '#800080', 'title' => 'Optional'],
        ];

        foreach ($labelTim as $lt) {
            DB::table('label_tim')->insert([
                'id' => (string) Str::uuid(),
                'warna' => $lt['warna'],
                'title' => $lt['title'],
                'id_tim_perusahaan' => $timId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // --- Seeder untuk label_card (5 data) ---
        // $labelCard = [
        //     ['warna' => '#FF69B4', 'title' => 'Bug'],
        //     ['warna' => '#1E90FF', 'title' => 'Feature'],
        //     ['warna' => '#32CD32', 'title' => 'Enhancement'],
        //     ['warna' => '#FFD700', 'title' => 'High Priority'],
        //     ['warna' => '#A9A9A9', 'title' => 'Low Priority'],
        // ];

        // foreach ($labelCard as $lc) {
        //     DB::table('label_card')->insert([
        //         'id' => (string) Str::uuid(),
        //         'warna' => $lc['warna'],
        //         'title' => $lc['title'],
        //         'id_card' => $cardId,
        //         'created_at' => now(),
        //         'updated_at' => now(),
        //     ]);
        // }
    }
}
