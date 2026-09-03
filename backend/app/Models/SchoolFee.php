<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SchoolFee extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'semester_id',
        'tuition',
        'miscellaneous',
        'laboratory',
        'library',
        'other_fees',
        'total_amount',
        'amount_paid',
        'balance',
        'status',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
    
    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
