<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\SchoolFee;
use Illuminate\Http\Request;

class PaymentController extends Controller {
    public function store(Request $request) {
        $request->validate([
            'school_fee_id' => 'required|exists:school_fees,id',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'nullable|string',
            'reference_number' => 'nullable|string',
        ]);

        $fee = SchoolFee::findOrFail($request->school_fee_id);

        $payment = Payment::create([
            'school_fee_id' => $fee->id,
            'amount' => $request->amount,
            'payment_date' => now(),
            'payment_method' => $request->payment_method ?? 'Cash',
            'reference_number' => $request->reference_number ?? 'REF-' . rand(10000, 99999),
        ]);

        $newPaid = $fee->amount_paid + $request->amount;
        $newBalance = max(0, $fee->total_amount - $newPaid);
        $status = $newBalance == 0 ? 'paid' : 'partial';

        $fee->update([
            'amount_paid' => $newPaid,
            'balance' => $newBalance,
            'status' => $status,
        ]);

        return response()->json($payment, 201);
    }
}
