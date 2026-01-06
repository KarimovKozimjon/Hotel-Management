<?php

namespace App\Services;

use App\Models\Role;
use Illuminate\Support\Collection;

class RoleQueryService
{
    public function list(): Collection
    {
        return Role::withCount('users')->get();
    }
}
