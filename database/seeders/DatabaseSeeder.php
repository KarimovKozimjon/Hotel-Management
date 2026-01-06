<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Guest;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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

        $adminEmail = (string) env('ADMIN_EMAIL', 'admin@hotel.com');
        $adminPassword = (string) env('ADMIN_PASSWORD', '');

        if ($adminPassword === '') {
            if (app()->environment('production')) {
                throw new \RuntimeException('ADMIN_PASSWORD must be set in production before seeding.');
            }

            $adminPassword = Str::random(20);
            $this->command?->warn('ADMIN_PASSWORD env is not set. Generated a random admin password for this seed run.');
            $this->command?->line('Admin email: ' . $adminEmail);
            $this->command?->line('Admin password: ' . $adminPassword);
        }

        // Admin foydalanuvchi yaratish
        User::create([
            'name' => 'Admin',
            'email' => $adminEmail,
            'password' => Hash::make($adminPassword),
            'role_id' => $adminRole?->id,
        ]);

        $guestEmail = (string) env('SEED_GUEST_EMAIL', 'guest@hotel.com');
        $guestPassword = (string) env('SEED_GUEST_PASSWORD', '');
        if ($guestPassword === '') {
            if (app()->environment('production')) {
                $guestPassword = Str::random(20);
            } else {
                $guestPassword = 'password';
            }
        }

        // Test mehmon yaratish
        Guest::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => $guestEmail,
            'password' => Hash::make($guestPassword),
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
