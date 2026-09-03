<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'section_id',
        'teacher_id',
        'date',
        'semester_id',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function records()
    {
        return $this->hasMany(AttendanceRecord::class);
    }
}
