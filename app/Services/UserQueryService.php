<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;

class UserQueryService
{
    public function list(): Collection
    {
        return User::with('role')->get();
    }
}
