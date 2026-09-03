<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EnrollmentSubject extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'subject_id',
        'section_id',
        'schedule_id',
    ];

    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }
    
    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }
}
