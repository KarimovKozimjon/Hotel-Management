<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService)
    {
    }

    public function index()
    {
        return response()->json($this->dashboardService->payload());
    }

    public function revenue(Request $request)
    {
        $period = $request->get('period', 'month'); // day, week, month, year

        return response()->json($this->dashboardService->revenueSeries($period));
    }
}
