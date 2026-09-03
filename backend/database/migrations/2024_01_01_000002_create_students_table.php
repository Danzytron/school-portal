<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('student_id_number')->unique();
            $table->foreignId('course_id')->nullable(); // will be constrained after courses table
            $table->integer('year_level')->default(1);
            $table->foreignId('section_id')->nullable(); // will be constrained after sections table
            $table->string('contact_number')->nullable();
            $table->text('address')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('enrollment_status', ['enrolled', 'not_enrolled', 'dropped', 'graduated'])->default('not_enrolled');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
