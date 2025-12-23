<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RoomType;
use App\Models\Room;
use App\Models\RoomImage;

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
            'amenities' => ['WiFi', 'TV', 'Air Conditioning'],
            'image_url' => 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'
        ]);

        $deluxeType = RoomType::create([
            'name' => 'Deluxe Room',
            'description' => 'Spacious room with premium amenities',
            'capacity' => 3,
            'base_price' => 200.00,
            'amenities' => ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'],
            'image_url' => 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
        ]);

        $suiteType = RoomType::create([
            'name' => 'Suite',
            'description' => 'Luxurious suite with living area',
            'capacity' => 4,
            'base_price' => 350.00,
            'amenities' => ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Kitchen', 'Jacuzzi'],
            'image_url' => 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800'
        ]);

        // Standard xonalarni yaratish
        $standardImages = [
            'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
            'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800',
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'
        ];
        
        for ($i = 101; $i <= 105; $i++) {
            $room = Room::create([
                'room_number' => (string)$i,
                'room_type_id' => $standardType->id,
                'floor' => 1,
                'status' => 'available',
                'description' => 'Standard room on first floor'
            ]);
            
            // Add images to room
            foreach ($standardImages as $index => $imageUrl) {
                RoomImage::create([
                    'room_id' => $room->id,
                    'image_path' => $imageUrl,
                    'is_primary' => $index === 0,
                    'order' => $index
                ]);
            }
        }

        // Deluxe xonalarni yaratish
        $deluxeImages = [
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'
        ];
        
        for ($i = 201; $i <= 203; $i++) {
            $room = Room::create([
                'room_number' => (string)$i,
                'room_type_id' => $deluxeType->id,
                'floor' => 2,
                'status' => 'available',
                'description' => 'Deluxe room on second floor'
            ]);
            
            // Add images to room
            foreach ($deluxeImages as $index => $imageUrl) {
                RoomImage::create([
                    'room_id' => $room->id,
                    'image_path' => $imageUrl,
                    'is_primary' => $index === 0,
                    'order' => $index
                ]);
            }
        }

        // Suite xonalarni yaratish
        $suiteImages = [
            'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800',
            'https://images.unsplash.com/photo-1617859047452-8510bcf207fd?w=800',
            'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800'
        ];
        
        for ($i = 301; $i <= 302; $i++) {
            $room = Room::create([
                'room_number' => (string)$i,
                'room_type_id' => $suiteType->id,
                'floor' => 3,
                'status' => 'available',
                'description' => 'Luxury suite on third floor'
            ]);
            
            // Add images to room
            foreach ($suiteImages as $index => $imageUrl) {
                RoomImage::create([
                    'room_id' => $room->id,
                    'image_path' => $imageUrl,
                    'is_primary' => $index === 0,
                    'order' => $index
                ]);
            }
        }
    }
}
