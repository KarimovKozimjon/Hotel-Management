<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Speeds up: $user->notifications()->latest('created_at')->limit(50)
            $table->index(['notifiable_type', 'notifiable_id', 'created_at'], 'notifications_notifiable_created_at_idx');
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('notifications_notifiable_created_at_idx');
        });
    }
};
