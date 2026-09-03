<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Teacher extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'employee_id',
        'department',
        'specialization',
        'contact_number',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function teacherSubjects()
    {
        return $this->hasMany(TeacherSubject::class);
    }
    
    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
}
