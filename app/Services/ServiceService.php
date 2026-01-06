<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Service;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class ServiceService
{
    /**
     * @return array{message: string, booking: Booking}|array{error: string, status: int}
     */
    public function addToBooking(int $bookingId, int $serviceId, int $quantity): array
    {
        return DB::transaction(function () use ($bookingId, $serviceId, $quantity): array {
            $booking = Booking::whereKey($bookingId)->lockForUpdate()->first();
            if (!$booking) {
                return ['error' => 'Booking not found', 'status' => 404];
            }

            if (in_array($booking->status, ['cancelled', 'completed'], true)) {
                return ['error' => 'Cannot add service to a cancelled or completed booking', 'status' => 422];
            }

            $service = Service::find($serviceId);
            if (!$service) {
                return ['error' => 'Service not found', 'status' => 404];
            }

            if (!$service->is_active) {
                return ['error' => 'This service is currently not available', 'status' => 422];
            }

            $now = now();
            $price = (float) $service->price;

            $pivot = DB::table('booking_services')
                ->where('booking_id', $booking->id)
                ->where('service_id', $serviceId)
                ->lockForUpdate()
                ->first();

            if ($pivot) {
                $oldTotal = (float) $pivot->total;
                $newQuantity = (int) $pivot->quantity + $quantity;
                $newTotal = $price * $newQuantity;

                DB::table('booking_services')
                    ->where('booking_id', $booking->id)
                    ->where('service_id', $serviceId)
                    ->update([
                        'quantity' => $newQuantity,
                        'price' => $price,
                        'total' => $newTotal,
                        'updated_at' => $now,
                    ]);

                $delta = round($newTotal - $oldTotal, 2);
                DB::update('update bookings set total_amount = total_amount + ? where id = ?', [$delta, $booking->id]);
                $booking->refresh();

                return [
                    'message' => 'Service quantity updated successfully',
                    'booking' => $booking->load('services'),
                ];
            }

            $total = $price * $quantity;

            try {
                DB::table('booking_services')->insert([
                    'booking_id' => $booking->id,
                    'service_id' => $serviceId,
                    'quantity' => $quantity,
                    'price' => $price,
                    'total' => $total,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            } catch (QueryException $e) {
                $errorInfo = $e->errorInfo;
                $sqlState = $errorInfo[0] ?? null;
                $driverCode = $errorInfo[1] ?? null;

                $isUniqueViolation = $sqlState === '23000' && (int) $driverCode === 1062;
                if (!$isUniqueViolation) {
                    throw $e;
                }

                $pivot = DB::table('booking_services')
                    ->where('booking_id', $booking->id)
                    ->where('service_id', $serviceId)
                    ->lockForUpdate()
                    ->first();

                if (!$pivot) {
                    throw $e;
                }

                $oldTotal = (float) $pivot->total;
                $newQuantity = (int) $pivot->quantity + $quantity;
                $newTotal = $price * $newQuantity;

                DB::table('booking_services')
                    ->where('booking_id', $booking->id)
                    ->where('service_id', $serviceId)
                    ->update([
                        'quantity' => $newQuantity,
                        'price' => $price,
                        'total' => $newTotal,
                        'updated_at' => $now,
                    ]);

                $delta = round($newTotal - $oldTotal, 2);
                DB::update('update bookings set total_amount = total_amount + ? where id = ?', [$delta, $booking->id]);
                $booking->refresh();

                return [
                    'message' => 'Service quantity updated successfully',
                    'booking' => $booking->load('services'),
                ];
            }

            DB::update('update bookings set total_amount = total_amount + ? where id = ?', [round((float) $total, 2), $booking->id]);
            $booking->refresh();

            return [
                'message' => 'Service added to booking successfully',
                'booking' => $booking->load('services'),
            ];
        }, 3);
    }
}
