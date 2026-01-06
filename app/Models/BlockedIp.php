<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlockedIp extends Model
{
    protected $fillable = [
        'ip',
        'blocked_until',
        'reason',
        'created_by_user_id',
    ];

    protected $casts = [
        'blocked_until' => 'datetime',
    ];

    public function isActive(): bool
    {
        return !$this->blocked_until || $this->blocked_until->isFuture();
    }
}
