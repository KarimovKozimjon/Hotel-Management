# 💳 Click.uz va Payme To'lov Integratsiyasi

## Umumiy Ma'lumot

Hotel Management tizimiga O'zbekistonning eng mashhur to'lov tizimlari - Click.uz va Payme integratsiya qilindi.

## Sozlash

### 1. Click.uz Sozlash

**A. Click.uz dan merchant akkaunt oching:**
1. https://click.uz/business ga kiring
2. Biznes akkaunt yarating
3. Merchant ID, Service ID, Secret Key oling

**B. .env faylni to'ldiring:**
```env
CLICK_MERCHANT_ID=sizning_merchant_id
CLICK_SERVICE_ID=sizning_service_id
CLICK_SECRET_KEY=sizning_secret_key
```

**C. Webhook URL'ni Click.uz da ro'yxatdan o'tkazing:**
```
Prepare URL: https://yourhotel.com/api/payment/click/prepare
Complete URL: https://yourhotel.com/api/payment/click/complete
```

### 2. Payme Sozlash

**A. Payme merchant akkaunt:**
1. https://payme.uz/business ga kiring
2. Merchant yarating
3. Merchant ID va Secret Key oling

**B. .env faylni to'ldiring:**
```env
PAYME_MERCHANT_ID=sizning_merchant_id
PAYME_SECRET_KEY=sizning_secret_key
PAYME_TEST_MODE=true
```

**C. Webhook URL:**
```
https://yourhotel.com/api/payment/payme/webhook
```

**D. Payme test rejimi:**
- Test kartalar: https://developer.help.paycom.uz/test-cards
- Test rejimda: `PAYME_TEST_MODE=true`
- Production: `PAYME_TEST_MODE=false`

## Qanday Ishlaydi

### Click.uz Jarayoni:

1. **Initiate Payment** - Guest to'lovni boshlaydi
   ```
   POST /api/payment/initiate
   {
     "booking_id": 1,
     "amount": 100.00,
     "gateway": "click"
   }
   ```

2. **Redirect** - Guest Click.uz sahifasiga yo'naltiriladi

3. **Prepare** - Click tekshiradi (webhook)
   ```
   POST /api/payment/click/prepare
   ```

4. **Complete** - To'lov tugallandi (webhook)
   ```
   POST /api/payment/click/complete
   ```

5. **Callback** - Guest qaytib keladi
   ```
   GET /guest/my-bookings?payment=success
   ```

### Payme Jarayoni:

1. **Initiate** - To'lovni boshlash
2. **CheckPerformTransaction** - Payme tekshiradi
3. **CreateTransaction** - Tranzaksiya yaratiladi
4. **PerformTransaction** - To'lov amalga oshiriladi
5. **Callback** - Guest qaytadi

## Frontend Qo'llanma

### Guest Payment Flow:

1. **My Bookings** → Unpaid booking
2. **To'lov qilish** tugmasini bosing
3. **O'zbekiston to'lov tizimlari** checkboxni belgilang
4. **Click.uz** yoki **Payme** tanlang
5. **Click.uz/Paymega o'tish** tugmasini bosing
6. Payment gateway sahifasida to'lovni amalga oshiring
7. Muvaffaqiyatli to'lovdan keyin avtomatik qaytarilasiz

## Test Qilish

### Development Mode (Local):

**1. Ngrok orqali public URL oling:**
```bash
ngrok http 8000
```

**2. Ngrok URL'ni Click/Payme da webhook sifatida ro'yxatdan o'tkazing:**
```
https://abc123.ngrok.io/api/payment/click/prepare
https://abc123.ngrok.io/api/payment/click/complete
https://abc123.ngrok.io/api/payment/payme/webhook
```

**3. Test kartalar (Payme):**
- Card: 8600 4954 0000 0162
- Expire: 03/99
- SMS Code: 666666

**4. Click.uz test:**
- Click test environment URL dan foydalaning
- Test merchant credentials bilan

### Manual Testing (Without Real Gateways):

Agar hali merchant akkauntingiz bo'lmasa, checkbox belgilamasdan oddiy to'lovlardan foydalaning:
- 💳 Bank kartasi
- 💵 Naqd pul
- 🌐 Online to'lov

## API Endpoints

### Public Endpoints (Webhooks):
```
POST /api/payment/click/prepare
POST /api/payment/click/complete
POST /api/payment/payme/webhook
```

### Protected Endpoints:
```
POST /api/payment/initiate       - To'lovni boshlash
GET  /api/payment/status         - To'lov holatini tekshirish
```

## Xavfsizlik

### Click.uz:
- MD5 signature validation
- Secret key bilan imzolash
- Server-to-server webhook calls

### Payme:
- Basic authentication
- Merchant secret key
- State machine (pending → completed)
- Transaction idempotency

## Xatoliklarni Hal Qilish

### 1. Webhook ishlamayapti:
- Public URL borligini tekshiring (ngrok)
- Webhook URL to'g'ri ro'yxatdan o'tganligini tekshiring
- Laravel log'larni ko'ring: `storage/logs/laravel.log`

### 2. "Invalid signature" xatosi:
- Secret key to'g'riligini tekshiring
- .env va config/payment.php mosligini tekshiring
- `php artisan config:cache`

### 3. Payment URL ochilmayapti:
- Merchant ID va Service ID to'g'riligini tekshiring
- Test mode yo'qligini tekshiring (production)

### 4. Callback ishlamayapti:
- Return URL to'g'ri ko'rsatilganligini tekshiring
- Frontend URL .env da to'g'ri sozlanganligini tekshiring

## Production Checklist

- [ ] Real merchant credentials olindi
- [ ] .env faylda to'g'ri sozlandi
- [ ] Webhook URLs ro'yxatdan o'tkazildi
- [ ] SSL sertifikat o'rnatildi (HTTPS)
- [ ] Test mode o'chirildi (`PAYME_TEST_MODE=false`)
- [ ] Transaction log monitoring sozlandi
- [ ] Error handling va retry logic qo'shildi
- [ ] Payment confirmation emails ishlaydi
- [ ] Refund jarayoni test qilindi

## Qo'llab-quvvatlash

### Click.uz:
- Dokumentatsiya: https://docs.click.uz/
- Texnik yordam: support@click.uz
- Telegram: @clickuz_support

### Payme:
- Dokumentatsiya: https://developer.help.paycom.uz/
- Texnik yordam: support@paycom.uz
- Telegram: @payme_support

## Narxlar va Komissiyalar

### Click.uz:
- Komissiya: ~2-3% (merchant bilan kelishiladi)
- Setup fee: Bepul
- Minimal to'lov: 1000 UZS

### Payme:
- Komissiya: ~2-3%
- Setup fee: Bepul
- Minimal to'lov: 1000 UZS

---

**Eslatma:** Production muhitda faqat HTTPS dan foydalaning. HTTP orqali to'lovlar xavfsiz emas!
