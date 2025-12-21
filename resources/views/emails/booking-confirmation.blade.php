@extends('emails.layout')

@section('content')
<h2 style="color: #667eea; margin-bottom: 20px;">✅ Booking Confirmed!</h2>

<p>Dear <strong>{{ $guest->first_name }} {{ $guest->last_name }}</strong>,</p>

<p>Thank you for choosing {{ config('app.name') }}! Your booking has been confirmed.</p>

<div class="booking-details">
    <h3 style="margin-bottom: 15px; color: #667eea;">📋 Booking Details</h3>
    
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
        <span class="detail-label">Number of Guests:</span>
        <span class="detail-value">{{ $booking->number_of_guests }}</span>
    </div>
    
    <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="detail-value">
            <span class="status-badge status-confirmed">{{ ucfirst($booking->status) }}</span>
        </span>
    </div>
    
    <div class="divider"></div>
    
    <div class="price-total">
        Total: ${{ number_format($booking->total_amount, 2) }}
    </div>
</div>

<div class="highlight">
    <strong>⏰ Check-in Time:</strong> After 2:00 PM<br>
    <strong>⏰ Check-out Time:</strong> Before 12:00 PM
</div>

<p>We're excited to welcome you! If you have any questions or special requests, please don't hesitate to contact us.</p>

<div style="text-align: center;">
    <a href="{{ config('app.url') }}/guest/my-bookings" class="button">View My Bookings</a>
</div>

<p style="margin-top: 30px;">Best regards,<br>
<strong>{{ config('app.name') }} Team</strong></p>
@endsection
