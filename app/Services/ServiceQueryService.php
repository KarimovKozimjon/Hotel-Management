<?php

namespace App\Services;

use App\Models\Service;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class ServiceQueryService
{
    public function query(array $filters = []): Builder
    {
        $query = Service::query();

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (array_key_exists('is_active', $filters) && $filters['is_active'] !== null && $filters['is_active'] !== '') {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        return $query;
    }

    public function list(array $filters = []): Collection
    {
        return $this->query($filters)->get();
    }
}
