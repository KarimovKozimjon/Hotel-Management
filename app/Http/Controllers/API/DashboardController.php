<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $today = now()->toDateString();
        $thisMonth = now()->month;
        $thisYear = now()->year;

        // Statistics
        $stats = [
            'total_rooms' => Room::count(),
            'available_rooms' => Room::where('status', 'available')->count(),
            'occupied_rooms' => Room::where('status', 'occupied')->count(),
            'maintenance_rooms' => Room::where('status', 'maintenance')->count(),
            
            'today_checkins' => Booking::whereDate('check_in_date', $today)
                ->where('status', 'confirmed')
                ->count(),
            
            'today_checkouts' => Booking::whereDate('check_out_date', $today)
                ->where('status', 'checked_in')
                ->count(),
            
            'total_bookings' => Booking::count(),
            'pending_bookings' => Booking::where('status', 'pending')->count(),
            'confirmed_bookings' => Booking::where('status', 'confirmed')->count(),
            
            'month_revenue' => Payment::whereYear('created_at', $thisYear)
                ->whereMonth('created_at', $thisMonth)
                ->where('status', 'completed')
                ->sum('amount'),
            
            'today_revenue' => Payment::whereDate('created_at', $today)
                ->where('status', 'completed')
                ->sum('amount'),
        ];

        // Recent bookings
        $recentBookings = Booking::with(['guest', 'room.roomType'])
            ->latest()
            ->take(5)
            ->get();

        // Upcoming check-ins
        $upcomingCheckIns = Booking::with(['guest', 'room'])
            ->where('check_in_date', '>=', $today)
            ->where('status', 'confirmed')
            ->orderBy('check_in_date')
            ->take(5)
            ->get();

        // Occupancy rate
        $totalRooms = Room::count();
        $occupiedRooms = Room::where('status', 'occupied')->count();
        $occupancyRate = $totalRooms > 0 ? round(($occupiedRooms / $totalRooms) * 100, 2) : 0;

        return response()->json([
            'stats' => $stats,
            'recent_bookings' => $recentBookings,
            'upcoming_checkins' => $upcomingCheckIns,
            'occupancy_rate' => $occupancyRate,
        ]);
    }

    public function revenue(Request $request)
    {
        $period = $request->get('period', 'month'); // day, week, month, year

        $query = Payment::where('status', 'completed');

        switch ($period) {
            case 'day':
                $data = $query->whereDate('created_at', now()->toDateString())
                    ->select(DB::raw('HOUR(created_at) as hour'), DB::raw('SUM(amount) as total'))
                    ->groupBy('hour')
                    ->get();
                break;
            
            case 'week':
                $data = $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                    ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(amount) as total'))
                    ->groupBy('date')
                    ->get();
                break;
            
            case 'month':
                $data = $query->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->select(DB::raw('DAY(created_at) as day'), DB::raw('SUM(amount) as total'))
                    ->groupBy('day')
                    ->get();
                break;
            
            case 'year':
                $data = $query->whereYear('created_at', now()->year)
                    ->select(DB::raw('MONTH(created_at) as month'), DB::raw('SUM(amount) as total'))
                    ->groupBy('month')
                    ->get();
                break;
        }

        return response()->json($data);
    }
}
