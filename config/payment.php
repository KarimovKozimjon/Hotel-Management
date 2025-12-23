<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Click Payment Configuration
    |--------------------------------------------------------------------------
    */
    'click' => [
        'merchant_id' => env('CLICK_MERCHANT_ID', ''),
        'service_id' => env('CLICK_SERVICE_ID', ''),
        'secret_key' => env('CLICK_SECRET_KEY', ''),
        'api_url' => env('CLICK_API_URL', 'https://api.click.uz/v2/merchant'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Payme Payment Configuration
    |--------------------------------------------------------------------------
    */
    'payme' => [
        'merchant_id' => env('PAYME_MERCHANT_ID', ''),
        'secret_key' => env('PAYME_SECRET_KEY', ''),
        'api_url' => env('PAYME_API_URL', 'https://checkout.paycom.uz/api'),
        'test_mode' => env('PAYME_TEST_MODE', true),
    ],
];
