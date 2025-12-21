<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Guest;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Rollarni yaratish
        $this->call(RoleSeeder::class);

        // Admin rolini olish
        $adminRole = Role::where('name', 'admin')->first();

        // Admin foydalanuvchi yaratish
        User::create([
            'name' => 'Admin',
            'email' => 'admin@hotel.com',
            'password' => Hash::make('admin123'),
            'role_id' => $adminRole?->id,
        ]);

        // Test mehmon yaratish
        Guest::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'guest@hotel.com',
            'password' => Hash::make('password'),
            'phone' => '+998901234567',
            'passport_number' => 'AB1234567',
            'date_of_birth' => '1990-01-01',
            'nationality' => 'Uzbekistan',
            'address' => 'Tashkent, Uzbekistan',
        ]);

        // Xonalar va boshqa ma'lumotlarni yaratish
        $this->call(RoomSeeder::class);
    }
}
