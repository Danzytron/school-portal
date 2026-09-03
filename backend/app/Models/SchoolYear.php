<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SchoolYear extends Model
{
    use HasFactory;

    protected $fillable = [
        'year_start',
        'year_end',
        'is_current',
    ];

    protected $casts = [
        'is_current' => 'boolean',
    ];

    public function semesters()
    {
        return $this->hasMany(Semester::class);
    }
}
