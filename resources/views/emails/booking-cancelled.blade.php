@extends('emails.layout')

@section('content')
<h2 style="color: #dc3545; margin-bottom: 20px;">❌ Booking Cancelled</h2>

<p>Dear <strong>{{ $guest->first_name }} {{ $guest->last_name }}</strong>,</p>

<p>This email confirms that your booking has been cancelled as requested.</p>

<div class="booking-details">
    <h3 style="margin-bottom: 15px; color: #dc3545;">📋 Cancelled Booking Details</h3>
    
    <div class="detail-row">
        <span class="detail-label">Booking ID:</span>
        <span class="detail-value">#{{ $booking->id }}</span>
    </div>
    
    <div class="detail-row">
        <span class="detail-label">Room Number:</span>
        <span class="detail-value">{{ $room->room_number }}</span>
    </div>
    
    <div class="detail-row">
        <span class="detail-label">Room Type:</span>
        <span class="detail-value">{{ $room->roomType->name }}</span>
    </div>
    
    <div class="detail-row">
        <span class="detail-label">Check-in Date:</span>
        <span class="detail-value">{{ \Carbon\Carbon::parse($booking->check_in_date)->format('M d, Y') }}</span>
    </div>
    
    <div class="detail-row">
        <span class="detail-label">Check-out Date:</span>
        <span class="detail-value">{{ \Carbon\Carbon::parse($booking->check_out_date)->format('M d, Y') }}</span>
    </div>
    
    <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="detail-value">
            <span class="status-badge status-cancelled">Cancelled</span>
        </span>
    </div>
    
    <div class="detail-row">
        <span class="detail-label">Cancellation Date:</span>
        <span class="detail-value">{{ now()->format('M d, Y H:i') }}</span>
    </div>
</div>

<div class="highlight">
    <strong>💰 Refund Information:</strong><br>
    If you have already made a payment, please allow 5-7 business days for the refund to be processed. 
    The refund will be credited to your original payment method.
</div>

<p>We're sorry to see you cancel your reservation. We hope to have the opportunity to serve you in the future.</p>

<p>If you have any questions about this cancellation or would like to make a new booking, please don't hesitate to contact us.</p>

<div style="text-align: center;">
    <a href="{{ config('app.url') }}/rooms" class="button">Browse Available Rooms</a>
</div>

<p style="margin-top: 30px;">Best regards,<br>
<strong>{{ config('app.name') }} Team</strong></p>
@endsection
