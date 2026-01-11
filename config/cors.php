<?php


$allowedOrigins = (string) env(
    'CORS_ALLOWED_ORIGINS',
    'https://comforthub.uz,https://hotel-management-q3hlpvtsp-karimovkozimjons-projects.vercel.app,https://hotel-management-five-drab.vercel.app,https://hotel-management-six-wine.vercel.app'
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

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => $allowedOriginsList,

    'allowed_origins_patterns' => [
        '/^https?:\/\/localhost(:[0-9]+)?$/',
        '/^https:\/\/hotel-management-[a-z0-9-]+\.vercel\.app$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [
        'Cache-Control',
        'Content-Language',
        'Content-Type',
        'Expires',
        'Last-Modified',
        'Pragma',
    ],

    'max_age' => 0,

    'supports_credentials' => filter_var(env('CORS_SUPPORTS_CREDENTIALS', false), FILTER_VALIDATE_BOOLEAN),
];
