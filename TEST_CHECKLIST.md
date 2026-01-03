# 🧪 HOTEL MANAGEMENT SYSTEM - TEST CHECKLIST

## 1️⃣ PUBLIC WEBSITE (Ommaviy Sayt) - http://localhost:3001/

### Bosh Sahifa (/)
- [ ] Hero section ko'rinadi
- [ ] Features cards (3 ta) ishlaydi
- [ ] Popular rooms ko'rsatiladi
- [ ] "View Rooms" tugmasi `/public/rooms` ga yo'naltiradi
- [ ] "Book Now" tugmasi `/guest/register` ga yo'naltiradi
- [ ] Navbar barcha linklar ishlaydi

### Xonalar Sahifasi (/public/rooms)
- [ ] Barcha xonalar ro'yxati ko'rinadi
- [ ] Xona turlari filter ishlaydi
- [ ] Har bir xonada: rasm, narx, amenities ko'rinadi
- [ ] "Book Now" tugmasi `/guest/register` ga yo'naltiradi
- [ ] Faqat "available" statusdagi xonalar ko'rinadi

### Biz Haqimizda (/public/about)
- [ ] Missiya bo'limi ko'rinadi
- [ ] Qadriyatlar (3 ta card) ko'rinadi
- [ ] Imkoniyatlar (6 ta) ko'rinadi
- [ ] Statistika ko'rinadi
- [ ] Jamoa a'zolari (3 ta) ko'rinadi
- [ ] "Bron qilish" tugmasi ishlaydi

### Bog'lanish (/public/contact)
- [ ] Kontakt forma ishlaydi (ism, email, telefon, mavzu, xabar)
- [ ] Forma validatsiyasi ishlaydi
- [ ] Aloqa ma'lumotlari to'g'ri ko'rinadi
- [ ] Xarita placeholder ko'rinadi
- [ ] FAQ bo'limi (6 ta savol) ko'rinadi

---

## 2️⃣ GUEST PORTAL (Mijoz Kabineti)

### Autentifikatsiya
#### Ro'yxatdan o'tish (/guest/register)
- [ ] Forma barcha maydonlar ko'rinadi (9 ta)
- [ ] Email validatsiyasi ishlaydi
- [ ] Parol tasdiqlash ishlaydi
- [ ] Muvaffaqiyatli ro'yxatdan o'tish
- [ ] Token localStorage ga saqlanadi
- [ ] `/guest/dashboard` ga yo'naltiriladi
- [ ] Xatolik xabarlari ko'rsatiladi

#### Kirish (/guest/login)
- [ ] Email va parol maydonlari ishlaydi
- [ ] "Eslab qolish" checkbox ishlaydi
- [ ] Test guest bilan kirish: guest@hotel.com / password
- [ ] Token to'g'ri saqlanadi
- [ ] Dashboard ga yo'naltiriladi
- [ ] Noto'g'ri ma'lumotlar xabari ko'rinadi
- [ ] "Ro'yxatdan o'tish" linki ishlaydi

### Asosiy Sahifalar

#### Dashboard (/guest/dashboard)
- [ ] Statistika kartlari ko'rinadi (4 ta)
- [ ] Jami bronlar soni to'g'ri
- [ ] Kelayotgan bronlar soni to'g'ri
- [ ] Jami sarflangan pul to'g'ri
- [ ] Sharhlar soni to'g'ri
- [ ] Real ma'lumotlar API dan olinadi
- [ ] Tezkor linklar ishlaydi

#### Xona Bronlash (/guest/book-room)
- [ ] Xonalar ro'yxati yuklanadi
- [ ] Filter maydonlari ishlaydi:
  - [ ] Check-in sana
  - [ ] Check-out sana
  - [ ] Xona turi
  - [ ] Minimum narx
  - [ ] Maksimum narx
- [ ] Qidiruv tugmasi ishlaydi
- [ ] Faqat available xonalar ko'rinadi
- [ ] Xona kartlari to'g'ri ko'rinadi
- [ ] "Book Now" tugmasi modal ochadi
- [ ] Modal oynada:
  - [ ] Xona ma'lumotlari to'g'ri
  - [ ] Check-in/out sanalar kiritiladi
  - [ ] Kattalar soni
  - [ ] Bolalar soni
  - [ ] Maxsus so'rovlar
  - [ ] Jami summa hisoblanadi
- [ ] Bron tasdiqlash ishlaydi
- [ ] Toast notification ko'rinadi
- [ ] Bronlar ro'yxati yangilanadi

#### Mening Bronlarim (/guest/my-bookings)
- [ ] Barcha bronlar ro'yxati ko'rinadi
- [ ] Bron ma'lumotlari to'liq:
  - [ ] Bron raqami
  - [ ] Xona ma'lumotlari
  - [ ] Kirish/Chiqish sanalari
  - [ ] Kattalar/Bolalar soni
  - [ ] Jami summa
  - [ ] Status badge
  - [ ] To'lov holati
- [ ] Status bo'yicha rangli badge:
  - [ ] Pending - sariq
  - [ ] Confirmed - ko'k
  - [ ] Checked_in - yashil
  - [ ] Checked_out - kulrang
  - [ ] Cancelled - qizil
- [ ] Harakatlar tugmalari:
  - [ ] To'lov qilish (confirmed + to'lanmagan)
  - [ ] Bekor qilish (pending/confirmed)
  - [ ] Sharh qoldirish (checked_out)

##### To'lov Modal
- [ ] To'lov modal ochiladi
- [ ] Bron ma'lumotlari to'g'ri
- [ ] Jami summa ko'rinadi
- [ ] 3 ta to'lov usuli:
  - [ ] Bank kartasi
  - [ ] Online to'lov
  - [ ] Naqd pul
- [ ] To'lash tugmasi ishlaydi
- [ ] To'lov muvaffaqiyatli amalga oshadi
- [ ] Status darhol "To'langan" ga o'zgaradi
- [ ] To'lov usuli ko'rsatiladi (💳/🌐/💵)
- [ ] To'lov tugmasi yo'qoladi

##### Bekor Qilish Modal
- [ ] Modal ochiladi
- [ ] Bron ma'lumotlari to'g'ri
- [ ] Ogohlantirish xabari ko'rinadi
- [ ] Bekor qilish shartlari ko'rsatiladi
- [ ] Tasdiqlash ishlaydi
- [ ] Status "Cancelled" ga o'zgaradi

##### Sharh Modal
- [ ] Modal ochiladi
- [ ] Xona ma'lumotlari to'g'ri
- [ ] Yulduzcha tanlash (1-5) ishlaydi
- [ ] Izoh maydoni ishlaydi
- [ ] Validatsiya ishlaydi
- [ ] Sharh yuboriladi
- [ ] Toast notification ko'rinadi

#### To'lovlar Tarixi

Eslatma: Guest uchun alohida "payment history" sahifa olib tashlangan (faqat "My Bookings" yetarli).
- [ ] Statistika kartlari ko'rinadi:
  - [ ] Jami to'lovlar
  - [ ] To'langan to'lovlar
  - [ ] Jami summa
- [ ] To'lovlar jadvali ko'rinadi
- [ ] Har bir to'lovda:
  - [ ] ID
  - [ ] Bron raqami
  - [ ] Summa
  - [ ] To'lov usuli (icon bilan)
  - [ ] Holat badge
  - [ ] Sana va vaqt
- [ ] Status badgelari:
  - [ ] Completed - yashil
  - [ ] Pending - sariq
  - [ ] Failed - qizil
  - [ ] Refunded - ko'k

#### Profilim (/guest/profile)
- [ ] Profil ma'lumotlari ko'rinadi
- [ ] Tahrirlash tugmasi ishlaydi
- [ ] Barcha maydonlar tahrir qilinadi:
  - [ ] Ism
  - [ ] Familiya
  - [ ] Email
  - [ ] Telefon
  - [ ] Pasport raqami
  - [ ] Tug'ilgan sana
  - [ ] Millat
  - [ ] Manzil
- [ ] Saqlash tugmasi ishlaydi
- [ ] Ma'lumotlar yangilanadi
- [ ] Toast notification ko'rinadi
- [ ] Bekor qilish ishlaydi

#### Parolni O'zgartirish (/guest/change-password)
- [ ] Joriy parol maydoni
- [ ] Yangi parol maydoni
- [ ] Parol tasdiqlash maydoni
- [ ] Validatsiya ishlaydi:
  - [ ] Minimum 6 belgi
  - [ ] Parollar mos kelishi
- [ ] Parol tavsiyalari ko'rinadi
- [ ] O'zgartirish tugmasi ishlaydi
- [ ] Muvaffaqiyatli o'zgaradi
- [ ] Forma tozalanadi

#### Chiqish
- [ ] Navbar da "Chiqish" tugmasi ishlaydi
- [ ] Token o'chiriladi
- [ ] `/guest/login` ga yo'naltiriladi
- [ ] Toast notification ko'rinadi

---

## 3️⃣ ADMIN PANEL (Xodimlar Paneli)

### Autentifikatsiya (/login)
- [ ] Login forma ko'rinadi
- [ ] Email va parol maydonlari ishlaydi
- [ ] Test admin bilan kirish: admin@hotel.com / admin123
- [ ] Token localStorage ga saqlanadi
- [ ] `/dashboard` ga yo'naltiriladi
- [ ] Xatolik xabarlari ko'rinadi

### Dashboard (/dashboard)
- [ ] Statistika kartlari (6 ta) ko'rinadi:
  - [ ] Jami xonalar
  - [ ] Bo'sh xonalar
  - [ ] Band xonalar
  - [ ] Bandlik foizi
  - [ ] Bugungi kirish
  - [ ] Bugungi chiqish
- [ ] Daromad kartlari (2 ta):
  - [ ] Bugungi daromad ($)
  - [ ] Oylik daromad ($)
- [ ] **GRAFIKLAR:**
  - [ ] Oylik daromad grafigi (Line Chart)
  - [ ] Haftalik bandlik grafigi (Bar Chart)
  - [ ] Xona turlari taqsimoti (Pie Chart)
- [ ] So'nggi bronlar jadvali ko'rinadi
- [ ] Barcha ma'lumotlar API dan olinadi

### Xonalar (/rooms)
- [ ] Xonalar ro'yxati ko'rinadi
- [ ] Qidiruv ishlaydi
- [ ] Pagination ishlaydi
- [ ] "Qo'shish" tugmasi modal ochadi
- [ ] Har bir xonada:
  - [ ] Xona raqami
  - [ ] Xona turi
  - [ ] Qavat
  - [ ] Narx
  - [ ] Status badge
  - [ ] Tahrirlash va O'chirish tugmalari
- [ ] Yangi xona qo'shish:
  - [ ] Barcha maydonlar to'ldiriladi
  - [ ] Validatsiya ishlaydi
  - [ ] Saqlash ishlaydi
- [ ] Tahrirlash:
  - [ ] Modal ma'lumotlar bilan ochiladi
  - [ ] O'zgartirishlar saqlanadi
- [ ] O'chirish:
  - [ ] Tasdiqlash modali
  - [ ] O'chiriladi

### Bronlar (/bookings)
- [ ] Bronlar ro'yxati ko'rinadi
- [ ] Qidiruv ishlaydi
- [ ] Status bo'yicha filter
- [ ] Har bir bronda:
  - [ ] Bron raqami
  - [ ] Mehmon ismi
  - [ ] Xona
  - [ ] Check-in/out sanalar
  - [ ] Status
  - [ ] Harakatlar
- [ ] Pending bronlar uchun:
  - [ ] "Tasdiqlash" tugmasi
  - [ ] "Bekor qilish" tugmasi
- [ ] Confirmed bronlar uchun:
  - [ ] "Check-in" tugmasi
  - [ ] "Bekor qilish" tugmasi
- [ ] Checked_in bronlar uchun:
  - [ ] "Check-out" tugmasi
- [ ] Har bir harakat ishlaydi
- [ ] Status yangilanadi

### Mehmonlar (/guests)
- [ ] Mehmonlar ro'yxati ko'rinadi
- [ ] Qidiruv ishlaydi
- [ ] Pagination ishlaydi
- [ ] Har bir mehmonda:
  - [ ] Ism va familiya
  - [ ] Email
  - [ ] Telefon
  - [ ] Pasport
  - [ ] Millat
  - [ ] Ko'rish tugmasi
- [ ] Detals modal:
  - [ ] To'liq ma'lumotlar
  - [ ] Bronlar tarixi
  - [ ] To'lovlar tarixi

### To'lovlar (/payments)
- [ ] To'lovlar ro'yxati ko'rinadi
- [ ] Filter ishlaydi (status, usul)
- [ ] Har bir to'lovda:
  - [ ] ID
  - [ ] Bron raqami
  - [ ] Summa
  - [ ] Usul
  - [ ] Status
  - [ ] Sana
- [ ] Tahrirlash ishlaydi
- [ ] O'chirish ishlaydi

### Xizmatlar (/services)
- [ ] Xizmatlar ro'yxati ko'rinadi
- [ ] Qo'shish modal ishlaydi
- [ ] Tahrirlash ishlaydi
- [ ] O'chirish ishlaydi
- [ ] Narx ko'rinadi

### Xona Turlari (/room-types)
- [ ] Xona turlari ro'yxati
- [ ] Qo'shish modal ishlaydi
- [ ] Har bir turda:
  - [ ] Nomi
  - [ ] Tavsif
  - [ ] Narx
  - [ ] Sig'im
  - [ ] Imkoniyatlar
- [ ] Tahrirlash ishlaydi
- [ ] O'chirish ishlaydi

### Foydalanuvchilar (/users)
- [ ] Foydalanuvchilar ro'yxati (faqat admin)
- [ ] Qo'shish modal ishlaydi
- [ ] Rol ko'rsatiladi
- [ ] Tahrirlash ishlaydi
- [ ] O'chirish ishlaydi

### Sharhlar (/reviews)
- [ ] Sharhlar ro'yxati ko'rinadi
- [ ] Har bir sharhda:
  - [ ] Mehmon ismi
  - [ ] Xona
  - [ ] Reyting (yulduzlar)
  - [ ] Izoh
  - [ ] Sana
- [ ] O'chirish ishlaydi
- [ ] Filterlash ishlaydi

### Navbar
- [ ] Barcha menyular ko'rinadi
- [ ] Active holat ishlaydi
- [ ] Chiqish tugmasi ishlaydi
- [ ] Foydalanuvchi nomi ko'rinadi

---

## 4️⃣ API ENDPOINTS TEST

### Public Endpoints
- [ ] GET /api/room-types
- [ ] GET /api/rooms

### Guest Auth Endpoints
- [ ] POST /api/guest/register
- [ ] POST /api/guest/login
- [ ] POST /api/guest/logout
- [ ] GET /api/guest/me
- [ ] GET /api/guest/my-bookings
- [ ] GET /api/guest/my-reviews
- [ ] GET /api/guest/payments
- [ ] PUT /api/guest/change-password

### Staff Auth Endpoints
- [ ] POST /api/login
- [ ] POST /api/logout
- [ ] GET /api/me

### Resource Endpoints (Authenticated)
- [ ] GET /api/rooms
- [ ] POST /api/rooms
- [ ] PUT /api/rooms/{id}
- [ ] DELETE /api/rooms/{id}
- [ ] GET /api/bookings
- [ ] POST /api/bookings
- [ ] POST /api/bookings/{id}/cancel
- [ ] POST /api/bookings/{id}/confirm
- [ ] POST /api/bookings/{id}/check-in
- [ ] POST /api/bookings/{id}/check-out
- [ ] GET /api/payments
- [ ] POST /api/payments
- [ ] GET /api/services
- [ ] POST /api/services
- [ ] GET /api/guests
- [ ] GET /api/reviews
- [ ] POST /api/reviews
- [ ] GET /api/users
- [ ] POST /api/users
- [ ] GET /api/dashboard/stats

---

## 5️⃣ UMUMIY FUNKSIYONALLIK

### Performance
- [ ] Sahifalar tez yuklanadi (< 2 soniya)
- [ ] API so'rovlar tez javob beradi
- [ ] Rasm va fayllar optimallashtirilgan

### Responsive Design
- [ ] Desktop (1920px) da to'g'ri ko'rinadi
- [ ] Laptop (1366px) da to'g'ri ko'rinadi
- [ ] Tablet (768px) da to'g'ri ko'rinadi
- [ ] Mobile (375px) da to'g'ri ko'rinadi

### Xavfsizlik
- [ ] Protected routes ishlaydi
- [ ] Token validatsiyasi ishlaydi
- [ ] CSRF himoyasi ishlaydi
- [ ] SQL injection himoyasi
- [ ] XSS himoyasi

### UX/UI
- [ ] Loading spinnerlar ko'rinadi
- [ ] Toast notifications ishlaydi
- [ ] Error messages aniq
- [ ] Form validatsiya xabarlari
- [ ] Ranglar va dizayn izchil

### Browser Compatibility
- [ ] Chrome da ishlaydi
- [ ] Firefox da ishlaydi
- [ ] Edge da ishlaydi
- [ ] Safari da ishlaydi

---

## 📊 TEST NATIJALAR

**Jami testlar:** ~200
**O'tgan:** 
**Muvaffaqiyatsiz:**
**O'tkazilmagan:**

**Kritik xatolar:**
- 

**Kichik xatolar:**
- 

**Takomillashtirish tavsiyalari:**
- 

---

## 🔧 KEYINGI BOSQICH UCHUN TAVSIYALAR

1. **Zarur funksiyalar:**
   - [ ] Xona rasmlari yuklash
   - [ ] Email bildirishnomalar
   - [ ] PDF invoice
  - [ ] Online to'lov integratsiyasi (o'chirilgan; faqat naqd/karta)

2. **Yaxshilashlar:**
   - [ ] Mobile responsive design
   - [ ] Multi-language support
   - [ ] Dark mode
   - [ ] Export to Excel/PDF

3. **Optimallashtirish:**
   - [ ] Caching
   - [ ] Database indexing
   - [ ] Image optimization
   - [ ] Code splitting
