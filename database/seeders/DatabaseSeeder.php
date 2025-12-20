<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
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

        // Admin role olish
        $adminRole = Role::where('name', 'admin')->first();
        $managerRole = Role::where('name', 'manager')->first();

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

        // Test foydalanuvchi
        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'role_id' => $adminRole?->id,
        ]);

        // Xonalar va boshqa ma'lumotlarni yaratish
        $this->call(RoomSeeder::class);
    }
}
