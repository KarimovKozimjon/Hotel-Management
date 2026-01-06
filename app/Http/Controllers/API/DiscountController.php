<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use App\Services\DiscountService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DiscountController extends Controller
{
    public function __construct(private readonly DiscountService $discountService)
    {
    }

    public function index()
    {
        return response()->json($this->discountService->list());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|unique:discounts,code|max:50',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_amount' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $discount = $this->discountService->create($validator->validated());
        return response()->json($discount, 201);
    }

    public function show($id)
    {
        $discount = Discount::find($id);
        
        if (!$discount) {
            return response()->json(['message' => 'Discount not found'], 404);
        }

        return response()->json($discount);
    }

    public function update(Request $request, $id)
    {
        $discount = Discount::find($id);
        
        if (!$discount) {
            return response()->json(['message' => 'Discount not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'string|unique:discounts,code,' . $id . '|max:50',
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'type' => 'in:percentage,fixed',
            'value' => 'numeric|min:0',
            'min_amount' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'start_date' => 'date',
            'end_date' => 'date|after_or_equal:start_date',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return response()->json($this->discountService->update($discount, $validator->validated()));
    }

    public function destroy($id)
    {
        $discount = Discount::find($id);
        
        if (!$discount) {
            return response()->json(['message' => 'Discount not found'], 404);
        }

        $this->discountService->delete($discount);
        return response()->json(['message' => 'Discount deleted successfully']);
    }

    public function validate_code(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
            'amount' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $result = $this->discountService->validateCode($request->code, (float) $request->amount);
        return response()->json($result['payload'], $result['status']);
    }
}
