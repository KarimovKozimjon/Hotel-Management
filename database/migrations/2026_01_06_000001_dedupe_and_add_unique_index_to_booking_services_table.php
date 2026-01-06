<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::transaction(function (): void {
            $duplicateGroups = DB::table('booking_services')
                ->select('booking_id', 'service_id', DB::raw('COUNT(*) as cnt'))
                ->groupBy('booking_id', 'service_id')
                ->having('cnt', '>', 1)
                ->get();

            foreach ($duplicateGroups as $group) {
                $rows = DB::table('booking_services')
                    ->where('booking_id', $group->booking_id)
                    ->where('service_id', $group->service_id)
                    ->orderByDesc('updated_at')
                    ->orderByDesc('id')
                    ->get();

                if ($rows->isEmpty()) {
                    continue;
                }

                $keeper = $rows->first();
                $keeperId = (int) $keeper->id;

                $totalQuantity = (int) $rows->sum('quantity');
                $totalTotal = (float) $rows->sum('total');

                DB::table('booking_services')
                    ->where('id', $keeperId)
                    ->update([
                        'quantity' => $totalQuantity,
                        'total' => round($totalTotal, 2),
                        'updated_at' => now(),
                    ]);

                $deleteIds = $rows
                    ->pluck('id')
                    ->map(function ($id) {
                        return (int) $id;
                    })
                    ->filter(function (int $id) use ($keeperId) {
                        return $id !== $keeperId;
                    })
                    ->values()
                    ->all();

                if (!empty($deleteIds)) {
                    DB::table('booking_services')->whereIn('id', $deleteIds)->delete();
                }
            }
        }, 3);

        $existing = DB::select("SHOW INDEX FROM booking_services WHERE Key_name = 'booking_services_booking_id_service_id_unique'");
        if (empty($existing)) {
            Schema::table('booking_services', function (Blueprint $table) {
                $table->unique(['booking_id', 'service_id'], 'booking_services_booking_id_service_id_unique');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $existing = DB::select("SHOW INDEX FROM booking_services WHERE Key_name = 'booking_services_booking_id_service_id_unique'");
        if (!empty($existing)) {
            Schema::table('booking_services', function (Blueprint $table) {
                $table->dropUnique('booking_services_booking_id_service_id_unique');
            });
        }
    }
};
