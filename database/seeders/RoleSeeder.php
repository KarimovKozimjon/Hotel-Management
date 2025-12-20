<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'admin', 'description' => 'System Administrator'],
            ['name' => 'manager', 'description' => 'Hotel Manager'],
            ['name' => 'receptionist', 'description' => 'Front Desk Receptionist'],
            ['name' => 'staff', 'description' => 'General Staff'],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}
