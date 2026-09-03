<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->integer('year_level');
            $table->foreignId('school_year_id')->constrained('school_years')->onDelete('cascade');
            $table->integer('max_students')->default(40);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        
        // Update students table to add foreign keys now that tables exist
        Schema::table('students', function (Blueprint $table) {
            $table->foreign('course_id')->references('id')->on('courses')->onDelete('set null');
            $table->foreign('section_id')->references('id')->on('sections')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['course_id']);
            $table->dropForeign(['section_id']);
        });
        Schema::dropIfExists('sections');
    }
};
