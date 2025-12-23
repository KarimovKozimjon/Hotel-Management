<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::where('email', 'admin@hotel.com')->first();

if ($user) {
    $user->password = Hash::make('admin123');
    $user->save();
    echo "✓ Password updated successfully!\n";
    echo "Email: admin@hotel.com\n";
    echo "Password: admin123\n";
    
    // Verify
    if (Hash::check('admin123', $user->password)) {
        echo "✓ Password verification: SUCCESS\n";
    } else {
        echo "✗ Password verification: FAILED\n";
    }
} else {
    echo "✗ User not found!\n";
}
