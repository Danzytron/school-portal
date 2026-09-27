<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            if (!Schema::hasColumn('announcements', 'category')) {
                $table->string('category')->default('general')->after('target_audience');
            }
            if (!Schema::hasColumn('announcements', 'priority')) {
                $table->string('priority')->default('normal')->after('category');
            }
            if (!Schema::hasColumn('announcements', 'is_important')) {
                $table->boolean('is_important')->default(false)->after('priority');
            }
        });
    }

    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            if (Schema::hasColumn('announcements', 'is_important')) {
                $table->dropColumn('is_important');
            }
            if (Schema::hasColumn('announcements', 'priority')) {
                $table->dropColumn('priority');
            }
            if (Schema::hasColumn('announcements', 'category')) {
                $table->dropColumn('category');
            }
        });
    }
};
