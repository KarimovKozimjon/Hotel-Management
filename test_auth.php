<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use Illuminate\Support\Facades\Auth;
use App\Models\User;

echo "=== Testing Auth::attempt() ===\n\n";

$credentials = [
    'email' => 'admin@hotel.com',
    'password' => 'admin123',
];

echo "Testing credentials:\n";
echo "  Email: {$credentials['email']}\n";
echo "  Password: {$credentials['password']}\n\n";

// Test with web guard
echo "Testing Auth::attempt() with web guard:\n";
$result = Auth::guard('web')->attempt($credentials);
echo "Result: " . ($result ? "✅ SUCCESS" : "❌ FAILED") . "\n\n";

if (!$result) {
    // Manual check
    echo "Manual verification:\n";
    $user = User::where('email', $credentials['email'])->first();
    
    if ($user) {
        echo "  User found: ✅\n";
        echo "  Password check: " . (Hash::check($credentials['password'], $user->password) ? "✅ MATCH" : "❌ NO MATCH") . "\n";
    } else {
        echo "  User found: ❌\n";
    }
}

echo "\n=== Test Complete ===\n";
