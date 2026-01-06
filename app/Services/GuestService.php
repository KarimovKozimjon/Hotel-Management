<?php

namespace App\Services;

use App\Models\Guest;

class GuestService
{
    public function create(array $validated): Guest
    {
        return Guest::create($validated);
    }

    public function update(Guest $guest, array $validated): Guest
    {
        $guest->update($validated);
        return $guest;
    }

    public function delete(Guest $guest): void
    {
        $guest->delete();
    }
}
