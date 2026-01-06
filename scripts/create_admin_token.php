<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::query()
    ->whereHas('role', function ($q) {
        $q->whereIn('name', ['Admin', 'admin']);
    })
    ->first();

if (!$user) {
    fwrite(STDERR, "NO_ADMIN_USER\n");
    exit(1);
}

$token = $user->createToken('perf')->plainTextToken;

$tokenFile = __DIR__ . '/../storage/app/perf_token.txt';
@file_put_contents($tokenFile, $token);

echo $token;
