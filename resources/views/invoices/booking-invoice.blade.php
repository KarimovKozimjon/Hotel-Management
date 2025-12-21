<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice - {{ $booking->booking_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #667eea;
        }
        .header h1 {
            color: #667eea;
            font-size: 28px;
            margin-bottom: 5px;
        }
        .header p {
            color: #666;
            font-size: 14px;
        }
        .invoice-info {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        .invoice-info-left, .invoice-info-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }
        .invoice-info-right {
            text-align: right;
        }
        .info-block {
            margin-bottom: 15px;
        }
        .info-block h3 {
            color: #667eea;
            font-size: 14px;
            margin-bottom: 8px;
            text-transform: uppercase;
        }
        .info-block p {
            margin: 3px 0;
            font-size: 12px;
        }
        .invoice-number {
            font-size: 20px;
            font-weight: bold;
            color: #667eea;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        thead {
            background-color: #667eea;
            color: white;
        }
        th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
        }
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #e0e0e0;
        }
        tbody tr:hover {
            background-color: #f8f9fa;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .totals-section {
            margin-top: 30px;
            float: right;
            width: 300px;
        }
        .total-row {
            display: table;
            width: 100%;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .total-row.grand-total {
            background-color: #667eea;
            color: white;
            padding: 12px;
            margin-top: 10px;
            font-size: 16px;
            font-weight: bold;
        }
        .total-label {
            display: table-cell;
            text-align: left;
        }
        .total-value {
            display: table-cell;
            text-align: right;
            font-weight: 600;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
        }
        .status-confirmed { background-color: #d4edda; color: #155724; }
        .status-pending { background-color: #fff3cd; color: #856404; }
        .status-checked-in { background-color: #d1ecf1; color: #0c5460; }
        .status-cancelled { background-color: #f8d7da; color: #721c24; }
        .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            text-align: center;
            color: #666;
            font-size: 11px;
        }
        .footer p {
            margin: 5px 0;
        }
        .payment-info {
            background-color: #f8f9fa;
            padding: 15px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
        }
        .payment-info h4 {
            color: #28a745;
            margin-bottom: 10px;
        }
        .notes {
            background-color: #fff3cd;
            padding: 15px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }
        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🏨 {{ config('app.name') }}</h1>
            <p>Premium Hotel Experience</p>
            <p>Tashkent, Uzbekistan | +998 90 123 45 67 | info@hotelmanagement.com</p>
        </div>

        <!-- Invoice Info -->
        <div class="invoice-info">
            <div class="invoice-info-left">
                <div class="info-block">
                    <h3>Bill To:</h3>
                    <p><strong>{{ $guest->first_name }} {{ $guest->last_name }}</strong></p>
                    <p>{{ $guest->email }}</p>
                    <p>{{ $guest->phone }}</p>
                    @if($guest->address)
                    <p>{{ $guest->address }}</p>
                    @endif
                </div>
            </div>
            <div class="invoice-info-right">
                <div class="info-block">
                    <h3>Invoice Details:</h3>
                    <p class="invoice-number">#{{ $booking->booking_number }}</p>
                    <p><strong>Invoice Date:</strong> {{ now()->format('M d, Y') }}</p>
                    <p><strong>Booking Date:</strong> {{ $booking->created_at->format('M d, Y') }}</p>
                    <p>
                        <strong>Status:</strong> 
                        <span class="status-badge status-{{ $booking->status }}">
                            {{ ucfirst($booking->status) }}
                        </span>
                    </p>
                </div>
            </div>
        </div>

        <!-- Booking Details -->
        <h3 style="color: #667eea; margin-bottom: 10px;">Reservation Details</h3>
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-center">Check-in</th>
                    <th class="text-center">Check-out</th>
                    <th class="text-center">Nights</th>
                    <th class="text-right">Rate/Night</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <strong>Room {{ $room->room_number }}</strong><br>
                        <small>{{ $room->roomType->name }}</small><br>
                        <small>Floor {{ $room->floor }}</small>
                    </td>
                    <td class="text-center">{{ \Carbon\Carbon::parse($booking->check_in_date)->format('M d, Y') }}</td>
                    <td class="text-center">{{ \Carbon\Carbon::parse($booking->check_out_date)->format('M d, Y') }}</td>
                    <td class="text-center">
                        {{ \Carbon\Carbon::parse($booking->check_in_date)->diffInDays(\Carbon\Carbon::parse($booking->check_out_date)) }}
                    </td>
                    <td class="text-right">${{ number_format($room->roomType->base_price, 2) }}</td>
                    <td class="text-right">${{ number_format($booking->total_amount, 2) }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Additional Services -->
        @if($services->count() > 0)
        <h3 style="color: #667eea; margin-bottom: 10px; margin-top: 30px;">Additional Services</h3>
        <table>
            <thead>
                <tr>
                    <th>Service</th>
                    <th class="text-center">Quantity</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($services as $service)
                <tr>
                    <td>{{ $service->name }}</td>
                    <td class="text-center">{{ $service->pivot->quantity ?? 1 }}</td>
                    <td class="text-right">${{ number_format($service->price, 2) }}</td>
                    <td class="text-right">${{ number_format($service->price * ($service->pivot->quantity ?? 1), 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        <!-- Totals -->
        <div class="clearfix">
            <div class="totals-section">
                <div class="total-row">
                    <span class="total-label">Subtotal:</span>
                    <span class="total-value">${{ number_format($booking->total_amount, 2) }}</span>
                </div>
                @if($services->count() > 0)
                <div class="total-row">
                    <span class="total-label">Services:</span>
                    <span class="total-value">${{ number_format($services->sum(function($s) { return $s->price * ($s->pivot->quantity ?? 1); }), 2) }}</span>
                </div>
                @endif
                <div class="total-row grand-total">
                    <span class="total-label">TOTAL:</span>
                    <span class="total-value">
                        ${{ number_format($booking->total_amount + $services->sum(function($s) { return $s->price * ($s->pivot->quantity ?? 1); }), 2) }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Payment Information -->
        @if($payments->count() > 0)
        <div style="clear: both; margin-top: 100px;">
            <div class="payment-info">
                <h4>💳 Payment Information</h4>
                @foreach($payments as $payment)
                <p>
                    <strong>{{ ucfirst($payment->payment_method) }}:</strong> 
                    ${{ number_format($payment->amount, 2) }} - 
                    <small>{{ $payment->created_at->format('M d, Y H:i') }}</small>
                    @if($payment->transaction_id)
                    <br><small>Transaction ID: {{ $payment->transaction_id }}</small>
                    @endif
                </p>
                @endforeach
                <p style="margin-top: 10px;">
                    <strong>Total Paid:</strong> ${{ number_format($payments->sum('amount'), 2) }}
                </p>
                @php
                    $totalDue = $booking->total_amount + $services->sum(function($s) { return $s->price * ($s->pivot->quantity ?? 1); });
                    $balance = $totalDue - $payments->sum('amount');
                @endphp
                @if($balance > 0)
                <p style="color: #dc3545; font-weight: bold;">
                    <strong>Balance Due:</strong> ${{ number_format($balance, 2) }}
                </p>
                @elseif($balance == 0)
                <p style="color: #28a745; font-weight: bold;">
                    ✓ PAID IN FULL
                </p>
                @endif
            </div>
        </div>
        @endif

        <!-- Notes -->
        @if($booking->special_requests)
        <div class="notes">
            <strong>Special Requests:</strong><br>
            {{ $booking->special_requests }}
        </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <p><strong>Thank you for choosing {{ config('app.name') }}!</strong></p>
            <p>For questions regarding this invoice, please contact us at support@hotelmanagement.com</p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
            <p style="margin-top: 10px; font-size: 10px;">
                Generated on {{ now()->format('F d, Y \a\t H:i') }}
            </p>
        </div>
    </div>
</body>
</html>
