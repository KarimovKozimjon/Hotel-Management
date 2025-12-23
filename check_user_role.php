<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Role;

echo "=== Checking User Role ===\n\n";

$user = User::where('email', 'admin@hotel.com')->first();

if (!$user) {
    echo "❌ User not found!\n";
    exit(1);
}

echo "User ID: {$user->id}\n";
echo "User Name: {$user->name}\n";
echo "User Email: {$user->email}\n";
echo "Role ID: {$user->role_id}\n";

if ($user->role) {
    echo "Role Name: {$user->role->name}\n";
    echo "✅ User has role assigned\n";
} else {
    echo "❌ User has NO role assigned\n";
    
    // Assign Admin role
    $adminRole = Role::where('name', 'Admin')->orWhere('name', 'admin')->first();
    
    if (!$adminRole) {
        echo "\n❌ Admin role not found in database!\n";
        echo "Available roles:\n";
        foreach (Role::all() as $role) {
            echo "  - ID: {$role->id}, Name: {$role->name}\n";
        }
        exit(1);
    }
    
    $user->role_id = $adminRole->id;
    $user->save();
    
    echo "\n✅ Admin role assigned to user!\n";
    echo "Role ID: {$adminRole->id}\n";
    echo "Role Name: {$adminRole->name}\n";
}

echo "\n=== Test Complete ===\n";
