<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Course extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'department',
        'description',
        'duration_years',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }

    public function sections()
    {
        return $this->hasMany(Section::class);
    }
    
    public function students()
    {
        return $this->hasMany(Student::class);
    }
}
