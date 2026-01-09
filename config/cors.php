<?php

$allowedOrigins = (string) env(
    'CORS_ALLOWED_ORIGINS',
    'https://comfort-hub.netlify.app,https://comfort-hub.infinityfreeapp.com,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000'
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
        '/^https:\/\/.*\.netlify\.app$/',
        '/^https?:\/\/localhost(:[0-9]+)?$/',
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
