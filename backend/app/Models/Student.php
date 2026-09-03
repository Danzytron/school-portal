<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'student_id_number',
        'course_id',
        'year_level',
        'section_id',
        'contact_number',
        'address',
        'date_of_birth',
        'enrollment_status',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }
    
    public function schoolFees()
    {
        return $this->hasMany(SchoolFee::class);
    }
    
    public function attendanceRecords()
    {
        return $this->hasMany(AttendanceRecord::class);
    }
    
    public function grades()
    {
        return $this->hasMany(Grade::class);
    }
}
