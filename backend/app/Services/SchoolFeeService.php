<?php

namespace App\Services;

use App\Models\SchoolFee;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class SchoolFeeService
{
    public function create(array $data)
    {
        $total = ($data['tuition'] ?? 0) + 
                 ($data['miscellaneous'] ?? 0) + 
                 ($data['laboratory'] ?? 0) + 
                 ($data['library'] ?? 0) + 
                 ($data['other_fees'] ?? 0);
                 
        $data['total_amount'] = $total;
        $data['balance'] = $total;
        $data['status'] = 'unpaid';

        return SchoolFee::create($data);
    }

    public function update(SchoolFee $fee, array $data)
    {
        $fee->update($data);
        $this->recalculateBalance($fee);
        return $fee;
    }

    public function recordPayment(SchoolFee $fee, array $data)
    {
        return DB::transaction(function () use ($fee, $data) {
            $payment = Payment::create([
                'school_fee_id' => $fee->id,
                'amount' => $data['amount'],
                'payment_date' => $data['payment_date'] ?? now(),
                'payment_method' => $data['payment_method'],
                'reference_number' => $data['reference_number'] ?? null,
                'received_by' => $data['received_by'] ?? null,
                'remarks' => $data['remarks'] ?? null,
            ]);

            $fee->amount_paid += $payment->amount;
            $fee->balance = $fee->total_amount - $fee->amount_paid;
            
            if ($fee->balance <= 0) {
                $fee->status = 'paid';
            } elseif ($fee->amount_paid > 0) {
                $fee->status = 'partial';
            }
            
            $fee->save();
            
            return $payment;
        });
    }
    
    private function recalculateBalance(SchoolFee $fee)
    {
        $fee->balance = $fee->total_amount - $fee->amount_paid;
        
        if ($fee->balance <= 0) {
            $fee->status = 'paid';
        } elseif ($fee->amount_paid > 0) {
            $fee->status = 'partial';
        } else {
            $fee->status = 'unpaid';
        }
        
        $fee->save();
    }

    public function getStudentFees($studentId, $semesterId = null)
    {
        $query = SchoolFee::where('student_id', $studentId)->with('payments');
        if ($semesterId) {
            $query->where('semester_id', $semesterId);
        }
        return $query->get();
    }
}
