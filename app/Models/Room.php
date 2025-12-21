<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_number',
        'room_type_id',
        'floor',
        'status',
        'description',
        'images',
    ];

    protected $casts = [
        'images' => 'array',
    ];

    public function roomType()
    {
        return $this->belongsTo(RoomType::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function images()
    {
        return $this->hasMany(RoomImage::class)->orderBy('order');
    }

    public function primaryImage()
    {
        return $this->hasOne(RoomImage::class)->where('is_primary', true);
    }
}
