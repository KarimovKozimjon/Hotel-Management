# Mehmonxona Boshqaruv Tizimi

Hotel Management System - Laravel + React

## Texnologiyalar

### Backend
- Laravel 11
- MySQL
- Laravel Sanctum (Authentication)

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

## O'rnatish

### Backend
```bash
# Dependencylarni o'rnatish
composer install

# .env faylini sozlash
cp .env.example .env
php artisan key:generate

# Ma'lumotlar bazasini sozlash
php artisan migrate
php artisan db:seed --class=RoleSeeder

# Serverni ishga tushirish
php artisan serve
```

### Frontend
```bash
cd frontend

# Dependencylarni o'rnatish
npm install

# Development serverni ishga tushirish
npm run dev
```

## API Endpoints

### Authentication
- POST `/api/register` - Ro'yxatdan o'tish
- POST `/api/login` - Kirish
- POST `/api/logout` - Chiqish
- GET `/api/me` - Hozirgi foydalanuvchi

### Rooms
- GET `/api/rooms` - Barcha xonalar
- POST `/api/rooms` - Yangi xona yaratish
- GET `/api/rooms/{id}` - Xona ma'lumotlari
- PUT `/api/rooms/{id}` - Xonani yangilash
- DELETE `/api/rooms/{id}` - Xonani o'chirish
- GET `/api/rooms/available` - Bo'sh xonalar

### Bookings
- GET `/api/bookings` - Barcha bronlar
- POST `/api/bookings` - Yangi bron yaratish
- GET `/api/bookings/{id}` - Bron ma'lumotlari
- PUT `/api/bookings/{id}` - Bronni yangilash
- DELETE `/api/bookings/{id}` - Bronni o'chirish
- POST `/api/bookings/{id}/check-in` - Check-in
- POST `/api/bookings/{id}/check-out` - Check-out
- POST `/api/bookings/{id}/cancel` - Bekor qilish

### Guests
- GET `/api/guests` - Barcha mehmonlar
- POST `/api/guests` - Yangi mehmon
- GET `/api/guests/{id}` - Mehmon ma'lumotlari
- PUT `/api/guests/{id}` - Mehmonni yangilash
- DELETE `/api/guests/{id}` - Mehmonni o'chirish

### Dashboard
- GET `/api/dashboard` - Dashboard statistikasi
- GET `/api/dashboard/revenue` - Daromad hisoboti

## Loyiha Strukturasi

### Backend
```
app/
├── Http/Controllers/API/
│   ├── AuthController.php
│   ├── RoomController.php
│   ├── BookingController.php
│   ├── GuestController.php
│   ├── PaymentController.php
│   └── DashboardController.php
├── Models/
│   ├── User.php
│   ├── Role.php
│   ├── Room.php
│   ├── RoomType.php
│   ├── Booking.php
│   ├── Guest.php
│   ├── Payment.php
│   └── Service.php
database/
├── migrations/
└── seeders/
```

### Frontend
```
src/
├── components/
│   ├── auth/
│   ├── common/
│   └── dashboard/
├── context/
├── services/
└── App.jsx
```

## Foydalanish

1. Backend serverni ishga tushiring: `php artisan serve`
2. Frontend serverni ishga tushiring: `npm run dev`
3. Brauzerda `http://localhost:3000` ga kiring
4. Login qiling yoki ro'yxatdan o'ting

## Litsenziya

MIT
