@extends('emails.layout')

@section('content')
<h2 style="color: #28a745; margin-bottom: 20px;">✅ Payment Received</h2>

<p>Dear <strong>{{ $guest->first_name }} {{ $guest->last_name }}</strong>,</p>

<p>Thank you for your payment. We have successfully received your payment.</p>

<div class="booking-details">
    <h3 style="margin-bottom: 15px; color: #667eea;">💳 Payment Details</h3>
    
    <div class="detail-row">
        <span class="detail-label">Payment ID:</span>
        <span class="detail-value">#{{ $payment->id }}</span>
    </div>
    
    <div class="detail-row">
        <span class="detail-label">Transaction ID:</span>
        <span class="detail-value">{{ $payment->transaction_id ?? 'N/A' }}</span>
    </div>
    
    <div class="detail-row">
        <span class="detail-label">Payment Date:</span>
        <span class="detail-value">{{ \Carbon\Carbon::parse($payment->payment_date)->format('M d, Y H:i') }}</span>
    </div>
    
    <div class="detail-row">
        <span class="detail-label">Payment Method:</span>
        <span class="detail-value">{{ ucfirst($payment->payment_method) }}</span>
    </div>
    
    <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="detail-value">
            <span class="status-badge status-confirmed">{{ ucfirst($payment->status) }}</span>
        </span>
    </div>
    
    <div class="divider"></div>
    
    <div class="price-total" style="color: #28a745;">
        Amount Paid: ${{ number_format($payment->amount, 2) }}
    </div>
</div>

<div class="booking-details" style="margin-top: 20px;">
    <h3 style="margin-bottom: 15px; color: #667eea;">📋 Booking Information</h3>
    
    <div class="detail-row">
        <span class="detail-label">Booking ID:</span>
        <span class="detail-value">#{{ $booking->id }}</span>
    </div>
    
    <div class="detail-row">
        <span class="detail-label">Room Number:</span>
        <span class="detail-value">{{ $booking->room->room_number }}</span>
    </div>
    
    <div class="detail-row">
        <span class="detail-label">Check-in:</span>
        <span class="detail-value">{{ \Carbon\Carbon::parse($booking->check_in_date)->format('M d, Y') }}</span>
    </div>
    
    <div class="detail-row">
        <span class="detail-label">Check-out:</span>
        <span class="detail-value">{{ \Carbon\Carbon::parse($booking->check_out_date)->format('M d, Y') }}</span>
    </div>
</div>

@if($payment->notes)
<div class="highlight">
    <strong>📝 Notes:</strong><br>
    {{ $payment->notes }}
</div>
@endif

<p>This receipt confirms that your payment has been processed successfully. Please keep this email for your records.</p>

<div style="text-align: center;">
    <a href="{{ config('app.url') }}/guest/payment-history" class="button">View Payment History</a>
</div>

<p style="margin-top: 30px;">Thank you for your business!<br>
<strong>{{ config('app.name') }} Team</strong></p>
@endsection
