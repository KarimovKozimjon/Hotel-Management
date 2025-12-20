<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RoomType;
use App\Models\Room;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        // Xona turlarini yaratish
        $standardType = RoomType::create([
            'name' => 'Standard Room',
            'description' => 'Comfortable room with basic amenities',
            'capacity' => 2,
            'base_price' => 100.00,
            'amenities' => ['WiFi', 'TV', 'Air Conditioning']
        ]);

        $deluxeType = RoomType::create([
            'name' => 'Deluxe Room',
            'description' => 'Spacious room with premium amenities',
            'capacity' => 3,
            'base_price' => 200.00,
            'amenities' => ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony']
        ]);

        $suiteType = RoomType::create([
            'name' => 'Suite',
            'description' => 'Luxurious suite with living area',
            'capacity' => 4,
            'base_price' => 350.00,
            'amenities' => ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Kitchen', 'Jacuzzi']
        ]);

        // Standard xonalarni yaratish
        for ($i = 101; $i <= 105; $i++) {
            Room::create([
                'room_number' => (string)$i,
                'room_type_id' => $standardType->id,
                'floor' => 1,
                'status' => 'available',
                'description' => 'Standard room on first floor'
            ]);
        }

        // Deluxe xonalarni yaratish
        for ($i = 201; $i <= 203; $i++) {
            Room::create([
                'room_number' => (string)$i,
                'room_type_id' => $deluxeType->id,
                'floor' => 2,
                'status' => 'available',
                'description' => 'Deluxe room on second floor'
            ]);
        }

        // Suite xonalarni yaratish
        for ($i = 301; $i <= 302; $i++) {
            Room::create([
                'room_number' => (string)$i,
                'room_type_id' => $suiteType->id,
                'floor' => 3,
                'status' => 'available',
                'description' => 'Luxury suite on third floor'
            ]);
        }
    }
}
