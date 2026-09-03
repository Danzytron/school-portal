<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_fee_id',
        'amount',
        'payment_date',
        'payment_method',
        'reference_number',
        'received_by',
        'remarks',
    ];

    protected $casts = [
        'payment_date' => 'date',
    ];

    public function schoolFee()
    {
        return $this->belongsTo(SchoolFee::class);
    }
}
