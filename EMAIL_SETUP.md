# 📧 Email Notification System - User Guide

## Overview
The hotel management system automatically sends email notifications for important events:
- ✅ Booking Confirmation
- 🔔 Check-in Reminder
- 💳 Payment Receipt
- ❌ Booking Cancellation

## Configuration

### 1. Email Settings (.env file)
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@hotelmanagement.com"
MAIL_FROM_NAME="Hotel Management"
```

### 2. Gmail Setup (Recommended)
1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Use App Password in `MAIL_PASSWORD`

### 3. Alternative Email Providers

**Mailtrap (Testing)**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
```

**SendGrid**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
```

## Email Templates

### 1. Booking Confirmation
**Sent when:** Guest creates a new booking
**Includes:**
- Booking ID and details
- Room information
- Check-in/out dates
- Total amount
- Check-in instructions

### 2. Check-in Reminder
**Sent when:** Admin marks booking as checked-in
**Includes:**
- Booking reminder
- Hotel address and contact
- Required documents checklist
- Check-in time

### 3. Payment Receipt
**Sent when:** Guest makes a payment
**Includes:**
- Payment ID and transaction details
- Amount paid
- Payment method
- Associated booking information

### 4. Booking Cancellation
**Sent when:** Booking is cancelled
**Includes:**
- Cancelled booking details
- Refund information
- Cancellation date

## Testing Emails

### Development Mode (Log Driver)
In `.env`, use log driver to test without sending actual emails:
```env
MAIL_MAILER=log
```
Emails will be saved to `storage/logs/laravel.log`

### Preview Email Templates
Visit these URLs in your browser (replace IDs with actual database IDs):

**Booking Confirmation:**
```
http://localhost:8000/test-emails/booking-confirmation/1
```

**Check-in Reminder:**
```
http://localhost:8000/test-emails/checkin-reminder/1
```

**Payment Receipt:**
```
http://localhost:8000/test-emails/payment-receipt/1
```

**Booking Cancellation:**
```
http://localhost:8000/test-emails/booking-cancelled/1
```

### Send Test Email
```
http://localhost:8000/test-emails/send/booking/1
http://localhost:8000/test-emails/send/checkin/1
http://localhost:8000/test-emails/send/payment/1
http://localhost:8000/test-emails/send/cancel/1
```

## Customization

### Email Design
Edit template files in `resources/views/emails/`:
- `layout.blade.php` - Base layout with header/footer
- `booking-confirmation.blade.php` - Booking confirmation template
- `checkin-reminder.blade.php` - Check-in reminder template
- `payment-receipt.blade.php` - Payment receipt template
- `booking-cancelled.blade.php` - Cancellation template

### Email Colors
Modify CSS in `layout.blade.php`:
```css
.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### From Name/Email
Update in `.env`:
```env
MAIL_FROM_ADDRESS="support@yourhotel.com"
MAIL_FROM_NAME="Your Hotel Name"
```

## Queue System (Optional)

For better performance, send emails asynchronously:

1. **Set Queue Driver** (.env):
```env
QUEUE_CONNECTION=database
```

2. **Run Queue Worker**:
```bash
php artisan queue:work
```

3. **Update Mailable Classes** (use queue):
```php
Mail::to($email)->queue(new BookingConfirmation($booking));
```

## Troubleshooting

### Emails Not Sending
1. Check `.env` configuration
2. Verify email credentials
3. Check `storage/logs/laravel.log` for errors
4. Test with Mailtrap first

### Gmail Blocking
- Enable "Less secure app access" (not recommended)
- Use App Password (recommended)
- Check Google account security settings

### Email in Spam
- Configure SPF/DKIM records
- Use professional domain email
- Avoid spam trigger words

## Production Checklist

- [ ] Update `MAIL_FROM_ADDRESS` to real domain email
- [ ] Configure proper SMTP credentials
- [ ] Remove test email routes from `routes/web.php`
- [ ] Set up queue worker for async sending
- [ ] Configure email logging/monitoring
- [ ] Test all email templates
- [ ] Set up email delivery tracking

## Support

For issues or questions:
- Check Laravel Mail documentation: https://laravel.com/docs/mail
- Review email logs in `storage/logs/`
- Test with different email providers

---

**Note:** Test email routes are only available in development mode (`APP_ENV=local`). They will be automatically disabled in production.
