<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginAttempt extends Model
{
    protected $fillable = [
        'guard',
        'email',
        'tokenable_type',
        'tokenable_id',
        'ip',
        'user_agent',
        'success',
        'reason',
    ];

    protected $casts = [
        'success' => 'boolean',
    ];

    public function tokenable()
    {
        return $this->morphTo();
    }
}
