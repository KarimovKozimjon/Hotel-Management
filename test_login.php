<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== Testing Login Credentials ===\n\n";

$user = User::where('email', 'admin@hotel.com')->first();

if (!$user) {
    echo "❌ User with email 'admin@hotel.com' not found!\n";
    echo "Creating admin user...\n\n";
    
    // Get admin role
    $adminRole = \App\Models\Role::where('name', 'admin')->first();
    
    if (!$adminRole) {
        echo "❌ Admin role not found! Run: php artisan db:seed --class=RoleSeeder\n";
        exit(1);
    }
    
    $user = User::create([
        'name' => 'Admin',
        'email' => 'admin@hotel.com',
        'password' => Hash::make('admin123'),
        'role_id' => $adminRole->id,
    ]);
    
    echo "✅ Admin user created successfully!\n";
}

echo "User found:\n";
echo "  ID: {$user->id}\n";
echo "  Name: {$user->name}\n";
echo "  Email: {$user->email}\n";
echo "  Role ID: {$user->role_id}\n";
echo "\nPassword Hash: {$user->password}\n\n";

// Test password
$testPassword = 'admin123';
$passwordMatch = Hash::check($testPassword, $user->password);

echo "Testing password 'admin123': ";
if ($passwordMatch) {
    echo "✅ Password matches!\n";
} else {
    echo "❌ Password does NOT match!\n";
    echo "Updating password to 'admin123'...\n";
    $user->password = Hash::make('admin123');
    $user->save();
    echo "✅ Password updated successfully!\n";
}

echo "\n=== Test Complete ===\n";
