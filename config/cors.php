<?php


$allowedOrigins = (string) env(
    'CORS_ALLOWED_ORIGINS',
    '*'
);

$allowedOriginsList = array_values(array_filter(array_map(
    static function ($origin) {
        $value = trim((string) $origin);
        if ($value === '') return null;
        if ($value === '*') return '*';
        return rtrim($value, '/');
    },
    explode(',', $allowedOrigins)
)));

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    /*
     | Qaysi URL’lar CORS ishlatishi mumkin
     */
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
    ],

    /*
     | Ruxsat etilgan HTTP methodlar
     */
    'allowed_methods' => ['*'],

    /*
     | RUXSAT ETILGAN FRONTEND DOMENLAR
     | env() YO‘Q — InfinityFree uchun to‘g‘ridan-to‘g‘ri yozilgan
     */
    'allowed_origins' => [
        '*',
    ],

    /*
     | Regex orqali origin ruxsat berish (kerak emas)
     */
    'allowed_origins_patterns' => [],

    /*
     | Ruxsat etilgan headerlar
     */
    'allowed_headers' => ['*'],

    /*
     | Frontend o‘qiy oladigan headerlar
     */
    'exposed_headers' => [],

    /*
     | Preflight cache vaqti
     */
    'max_age' => 0,

    /*
     | Cookie / Authorization kerak emas → false
     */
    'supports_credentials' => false,
];
