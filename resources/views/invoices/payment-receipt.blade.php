<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Payment Receipt - #{{ $payment->id }}</title>
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
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #28a745;
        }
        .header h1 {
            color: #28a745;
            font-size: 32px;
            margin-bottom: 5px;
        }
        .header h2 {
            color: #666;
            font-size: 18px;
            font-weight: normal;
        }
        .receipt-info {
            background-color: #f8f9fa;
            padding: 20px;
            margin: 20px 0;
            border-left: 5px solid #28a745;
        }
        .receipt-info h3 {
            color: #28a745;
            margin-bottom: 15px;
            font-size: 16px;
        }
        .info-row {
            display: table;
            width: 100%;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            display: table-cell;
            width: 40%;
            font-weight: 600;
            color: #666;
        }
        .info-value {
            display: table-cell;
            width: 60%;
            text-align: right;
        }
        .amount-box {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            border-radius: 8px;
        }
        .amount-box h2 {
            font-size: 14px;
            margin-bottom: 10px;
            opacity: 0.9;
        }
        .amount-box .amount {
            font-size: 48px;
            font-weight: bold;
            margin: 10px 0;
        }
        .amount-box .status {
            font-size: 16px;
            background-color: rgba(255,255,255,0.2);
            display: inline-block;
            padding: 8px 20px;
            border-radius: 20px;
            margin-top: 10px;
        }
        .booking-details {
            margin: 30px 0;
        }
        .booking-details h3 {
            color: #667eea;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #e0e0e0;
        }
        .label-col {
            font-weight: 600;
            color: #666;
            width: 40%;
        }
        .value-col {
            text-align: right;
        }
        .stamp {
            text-align: center;
            margin: 40px 0;
            padding: 20px;
            border: 3px dashed #28a745;
            background-color: #f8f9fa;
        }
        .stamp h2 {
            color: #28a745;
            font-size: 24px;
            margin-bottom: 10px;
        }
        .stamp p {
            color: #666;
            font-size: 14px;
        }
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
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 100px;
            color: rgba(40, 167, 69, 0.1);
            font-weight: bold;
            z-index: -1;
        }
    </style>
</head>
<body>
    <div class="watermark">PAID</div>
    
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>✓ PAYMENT RECEIPT</h1>
            <h2>{{ config('app.name') }}</h2>
            <p style="margin-top: 10px;">Tashkent, Uzbekistan | +998 90 123 45 67</p>
        </div>

        <!-- Receipt Info -->
        <div class="receipt-info">
            <h3>Receipt Information</h3>
            <div class="info-row">
                <span class="info-label">Receipt Number:</span>
                <span class="info-value"><strong>#{{ str_pad($payment->id, 6, '0', STR_PAD_LEFT) }}</strong></span>
            </div>
            <div class="info-row">
                <span class="info-label">Payment Date:</span>
                <span class="info-value">{{ $payment->created_at->format('F d, Y') }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Payment Time:</span>
                <span class="info-value">{{ $payment->created_at->format('H:i:s') }}</span>
            </div>
            @if($payment->transaction_id)
            <div class="info-row">
                <span class="info-label">Transaction ID:</span>
                <span class="info-value">{{ $payment->transaction_id }}</span>
            </div>
            @endif
        </div>

        <!-- Amount Box -->
        <div class="amount-box">
            <h2>AMOUNT PAID</h2>
            <div class="amount">${{ number_format($payment->amount, 2) }}</div>
            <div class="status">{{ strtoupper($payment->status) }}</div>
        </div>

        <!-- Payment Details -->
        <table>
            <tr>
                <td class="label-col">Payment Method:</td>
                <td class="value-col">
                    @switch($payment->payment_method)
                        @case('card')
                            💳 Credit/Debit Card
                            @break
                        @case('cash')
                            💵 Cash
                            @break
                        @case('online')
                            🌐 Online Payment
                            @break
                        @case('bank_transfer')
                            🏦 Bank Transfer
                            @break
                        @default
                            {{ ucfirst($payment->payment_method) }}
                    @endswitch
                </td>
            </tr>
            <tr>
                <td class="label-col">Paid By:</td>
                <td class="value-col"><strong>{{ $guest->first_name }} {{ $guest->last_name }}</strong></td>
            </tr>
            <tr>
                <td class="label-col">Email:</td>
                <td class="value-col">{{ $guest->email }}</td>
            </tr>
            <tr>
                <td class="label-col">Phone:</td>
                <td class="value-col">{{ $guest->phone }}</td>
            </tr>
        </table>

        <!-- Booking Details -->
        <div class="booking-details">
            <h3>📋 Related Booking</h3>
            <table>
                <tr>
                    <td class="label-col">Booking Number:</td>
                    <td class="value-col"><strong>{{ $booking->booking_number }}</strong></td>
                </tr>
                <tr>
                    <td class="label-col">Room:</td>
                    <td class="value-col">{{ $booking->room->room_number }} - {{ $booking->room->roomType->name }}</td>
                </tr>
                <tr>
                    <td class="label-col">Check-in Date:</td>
                    <td class="value-col">{{ \Carbon\Carbon::parse($booking->check_in_date)->format('M d, Y') }}</td>
                </tr>
                <tr>
                    <td class="label-col">Check-out Date:</td>
                    <td class="value-col">{{ \Carbon\Carbon::parse($booking->check_out_date)->format('M d, Y') }}</td>
                </tr>
                <tr>
                    <td class="label-col">Booking Status:</td>
                    <td class="value-col">{{ ucfirst($booking->status) }}</td>
                </tr>
            </table>
        </div>

        @if($payment->notes)
        <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <strong>Notes:</strong><br>
            {{ $payment->notes }}
        </div>
        @endif

        <!-- Stamp -->
        <div class="stamp">
            <h2>✓ PAYMENT CONFIRMED</h2>
            <p>This receipt is valid and confirms the payment has been received.</p>
            <p style="margin-top: 10px; font-size: 12px;">
                <strong>{{ config('app.name') }}</strong>
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Thank you for your payment!</strong></p>
            <p>This is an official payment receipt from {{ config('app.name') }}</p>
            <p>For any inquiries, please contact us at support@hotelmanagement.com or +998 90 123 45 67</p>
            <p style="margin-top: 15px; font-size: 10px;">
                This is a computer-generated receipt and does not require a signature.<br>
                Generated on {{ now()->format('F d, Y \a\t H:i') }}
            </p>
        </div>
    </div>
</body>
</html>
