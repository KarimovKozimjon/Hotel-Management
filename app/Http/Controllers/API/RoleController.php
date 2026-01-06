<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Services\RoleQueryService;
use App\Services\RoleService;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function __construct(
        private readonly RoleQueryService $roleQueryService,
        private readonly RoleService $roleService,
    ) {
    }

    public function index()
    {
        return response()->json($this->roleQueryService->list());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles|max:255',
            'description' => 'nullable|string',
        ]);

        $role = $this->roleService->create($validated);

        return response()->json($role, 201);
    }

    public function show(Role $role)
    {
        return response()->json($role->load('users'));
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|unique:roles,name,' . $role->id . '|max:255',
            'description' => 'nullable|string',
        ]);

        $role = $this->roleService->update($role, $validated);

        return response()->json($role);
    }

    public function destroy(Role $role)
    {
        $result = $this->roleService->delete($role);
        if (!$result['ok']) {
            return response()->json(['message' => $result['message']], 403);
        }

        return response()->json(['message' => 'Role deleted successfully']);
    }
}
