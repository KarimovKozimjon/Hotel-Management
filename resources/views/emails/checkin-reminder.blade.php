@extends('emails.layout')

@section('content')
<h2 style="color: #667eea; margin-bottom: 20px;">🔔 Check-in Reminder</h2>

<p>Dear <strong>{{ $guest->first_name }} {{ $guest->last_name }}</strong>,</p>

<p>This is a friendly reminder that your check-in date is approaching!</p>

<div class="booking-details">
    <h3 style="margin-bottom: 15px; color: #667eea;">📋 Your Reservation</h3>
    
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
        <span class="detail-value" style="font-weight: bold; color: #667eea;">
            {{ \Carbon\Carbon::parse($booking->check_in_date)->format('M d, Y') }}
        </span>
    </div>
    
    <div class="detail-row">
        <span class="detail-label">Check-out Date:</span>
        <span class="detail-value">{{ \Carbon\Carbon::parse($booking->check_out_date)->format('M d, Y') }}</span>
    </div>
</div>

<div class="highlight">
    <strong>📍 Hotel Address:</strong><br>
    {{ config('app.name') }}<br>
    Tashkent, Uzbekistan<br><br>
    <strong>⏰ Check-in Time:</strong> After 2:00 PM<br>
    <strong>📞 Contact:</strong> +998 90 123 45 67
</div>

<p><strong>Please bring:</strong></p>
<ul style="margin-left: 20px; margin-bottom: 20px;">
    <li>Valid ID or Passport</li>
    <li>Payment method for any additional charges</li>
    <li>Booking confirmation (this email)</li>
</ul>

<div style="text-align: center;">
    <a href="{{ config('app.url') }}/guest/my-bookings" class="button">View Booking Details</a>
</div>

<p style="margin-top: 30px;">We look forward to welcoming you!<br>
<strong>{{ config('app.name') }} Team</strong></p>
@endsection
