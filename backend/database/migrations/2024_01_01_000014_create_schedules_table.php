<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('section_id')->constrained()->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->foreignId('semester_id')->constrained()->onDelete('cascade');
            $table->enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
            $table->time('start_time');
            $table->time('end_time');
            $table->timestamps();
        });
        
        Schema::table('enrollment_subjects', function (Blueprint $table) {
            $table->foreign('schedule_id')->references('id')->on('schedules')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('enrollment_subjects', function (Blueprint $table) {
            $table->dropForeign(['schedule_id']);
        });
        Schema::dropIfExists('schedules');
    }
};
