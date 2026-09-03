<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'semester_id',
        'status',
        'enrolled_at',
        'approved_by',
        'remarks',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function enrollmentSubjects()
    {
        return $this->hasMany(EnrollmentSubject::class);
    }

    public function subjects()
    {
        return $this->hasMany(EnrollmentSubject::class);
    }
}
