<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'image_path',
        'is_primary',
        'order'
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'order' => 'integer'
    ];

    protected $appends = ['image_url'];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function getImageUrlAttribute()
    {
        return url('storage/' . $this->image_path);
    }
}
