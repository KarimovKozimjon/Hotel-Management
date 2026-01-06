<?php

namespace App\Services;

use App\Models\Role;

class RoleService
{
    public function create(array $validated): Role
    {
        return Role::create($validated);
    }

    public function update(Role $role, array $validated): Role
    {
        $role->update($validated);
        return $role;
    }

    /**
     * @return array{ok: bool, message?: string}
     */
    public function delete(Role $role): array
    {
        if ($role->users()->count() > 0) {
            return ['ok' => false, 'message' => 'Cannot delete role with existing users'];
        }

        $role->delete();
        return ['ok' => true];
    }
}
