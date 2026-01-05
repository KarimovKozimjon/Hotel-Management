<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RoomType;
use App\Models\Room;
use App\Models\RoomImage;
use Illuminate\Support\Facades\Schema;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        // Idempotent seeding: clear existing data first
        Schema::disableForeignKeyConstraints();
        RoomImage::truncate();
        Room::truncate();
        RoomType::truncate();
        Schema::enableForeignKeyConstraints();

        // Xona turlarini yaratish
        $standardType = RoomType::create([
            // Stable key (translated in frontend)
            'name' => 'standard',
            'description' => null,
            'capacity' => 2,
            'base_price' => 100.00,
            'amenities' => ['wifi', 'tv', 'airConditioning'],
            'image_url' => 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'
        ]);

        $deluxeType = RoomType::create([
            // Stable key (translated in frontend)
            'name' => 'deluxe',
            'description' => null,
            'capacity' => 3,
            'base_price' => 200.00,
            'amenities' => ['wifi', 'tv', 'airConditioning', 'miniBar', 'balcony'],
            'image_url' => 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
        ]);

        $presidentialType = RoomType::create([
            // Stable key (translated in frontend)
            'name' => 'presidential',
            'description' => null,
            'capacity' => 4,
            'base_price' => 350.00,
            'amenities' => ['wifi', 'tv', 'airConditioning', 'miniBar', 'balcony', 'kitchen', 'jacuzzi'],
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
                'room_type_id' => $presidentialType->id,
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
