<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\InvoiceService;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function __construct(private readonly InvoiceService $invoiceService)
    {
    }

    public function generateBookingInvoice(Request $request, $bookingId)
    {
        try {
            return $this->invoiceService->bookingInvoiceDownload($bookingId, $request->user());
        } catch (\Throwable $e) {
            \Log::error('Invoice PDF generation error: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json([
                'error' => 'Invoice generation failed',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function generatePaymentReceipt(Request $request, $paymentId)
    {
        return $this->invoiceService->paymentReceiptDownload($paymentId, $request->user());
    }

    public function previewBookingInvoice(Request $request, $bookingId)
    {
        return $this->invoiceService->bookingInvoiceView($bookingId, $request->user());
    }

    public function previewPaymentReceipt(Request $request, $paymentId)
    {
        return $this->invoiceService->paymentReceiptView($paymentId, $request->user());
    }
}
