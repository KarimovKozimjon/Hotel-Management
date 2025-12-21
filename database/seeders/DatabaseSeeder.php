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

        // Rollarni olish
        $adminRole = Role::where('name', 'Admin')->first();
        $managerRole = Role::where('name', 'Manager')->first();
        $staffRole = Role::where('name', 'Staff')->first();

        // Admin foydalanuvchi yaratish
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@hotel.com',
            'password' => Hash::make('password'),
            'role_id' => $adminRole?->id,
        ]);

        // Manager foydalanuvchi yaratish
        User::create([
            'name' => 'Manager User',
            'email' => 'manager@hotel.com',
            'password' => Hash::make('password'),
            'role_id' => $managerRole?->id,
        ]);

        // Staff foydalanuvchi yaratish
        User::create([
            'name' => 'Staff User',
            'email' => 'staff@hotel.com',
            'password' => Hash::make('password'),
            'role_id' => $staffRole?->id,
        ]);

        // Test foydalanuvchi
        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
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
