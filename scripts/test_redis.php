<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

echo "cache.default=" . config('cache.default') . PHP_EOL;
echo "session.driver=" . config('session.driver') . PHP_EOL;
echo "redis.client=" . config('database.redis.client') . PHP_EOL;

try {
    $pong = Redis::connection('default')->ping();
    echo "redis.ping=" . (is_string($pong) ? $pong : json_encode($pong)) . PHP_EOL;
} catch (Throwable $e) {
    echo "redis.ping.ERROR=" . $e->getMessage() . PHP_EOL;
}

$key = 'perf:test:' . bin2hex(random_bytes(4));

try {
    Cache::put($key, 'ok', 60);
    $val = Cache::get($key);
    echo "cache.put_get=" . ($val ?? 'null') . PHP_EOL;
    Cache::forget($key);
} catch (Throwable $e) {
    echo "cache.ERROR=" . $e->getMessage() . PHP_EOL;
}
