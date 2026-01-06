<?php

namespace App\Services;

use App\Models\Discount;
use Illuminate\Support\Collection;

class DiscountService
{
    public function list(): Collection
    {
        return Discount::orderBy('created_at', 'desc')->get();
    }

    public function create(array $validated): Discount
    {
        return Discount::create($validated);
    }

    public function update(Discount $discount, array $validated): Discount
    {
        $discount->update($validated);
        return $discount;
    }

    public function delete(Discount $discount): void
    {
        $discount->delete();
    }

    /**
     * @return array{ok: bool, status: int, payload: array}
     */
    public function validateCode(string $code, float $amount): array
    {
        $discount = Discount::where('code', $code)->first();

        if (!$discount) {
            return [
                'ok' => false,
                'status' => 404,
                'payload' => [
                    'valid' => false,
                    'message' => 'Chegirma kodi topilmadi',
                ],
            ];
        }

        if (!$discount->isValid($amount)) {
            return [
                'ok' => false,
                'status' => 400,
                'payload' => [
                    'valid' => false,
                    'message' => 'Chegirma kodi yaroqsiz yoki muddati o\'tgan',
                ],
            ];
        }

        $discountAmount = $discount->calculateDiscount($amount);

        return [
            'ok' => true,
            'status' => 200,
            'payload' => [
                'valid' => true,
                'discount' => $discount,
                'discount_amount' => $discountAmount,
                'final_amount' => $amount - $discountAmount,
                'message' => 'Chegirma muvaffaqiyatli qo\'llanildi',
            ],
        ];
    }
}
