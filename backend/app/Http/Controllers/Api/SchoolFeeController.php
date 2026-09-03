<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SchoolFeeService;
use App\Models\SchoolFee;
use Illuminate\Http\Request;

class SchoolFeeController extends Controller
{
    protected $feeService;

    public function __construct(SchoolFeeService $feeService)
    {
        $this->feeService = $feeService;
    }

    public function index(Request $request)
    {
        $query = SchoolFee::with(['student.user', 'student.course', 'semester', 'payments']);
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        return response()->json($query->paginate($request->get('per_page', 15)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'tuition' => 'nullable|numeric',
            'miscellaneous' => 'nullable|numeric',
            'laboratory' => 'nullable|numeric',
            'library' => 'nullable|numeric',
            'other_fees' => 'nullable|numeric',
        ]);

        $tuition = $validated['tuition'] ?? 25000;
        $misc = $validated['miscellaneous'] ?? 5000;
        $lab = $validated['laboratory'] ?? 3000;
        $lib = $validated['library'] ?? 1000;
        $other = $validated['other_fees'] ?? 500;
        $total = $tuition + $misc + $lab + $lib + $other;

        $fee = SchoolFee::create([
            'student_id' => $validated['student_id'],
            'semester_id' => $validated['semester_id'] ?? 1,
            'tuition' => $tuition,
            'miscellaneous' => $misc,
            'laboratory' => $lab,
            'library' => $lib,
            'other_fees' => $other,
            'total_amount' => $total,
            'amount_paid' => 0,
            'balance' => $total,
            'status' => 'unpaid',
        ]);

        return response()->json($fee, 201);
    }

    public function update(Request $request, $id)
    {
        $fee = SchoolFee::findOrFail($id);
        $fee->update($request->only(['tuition', 'miscellaneous', 'laboratory', 'library', 'other_fees', 'total_amount', 'status']));
        return response()->json($fee);
    }

    public function recordPayment(Request $request, $id)
    {
        $fee = SchoolFee::findOrFail($id);
        $amount = $request->input('amount', 0);

        $payment = $fee->payments()->create([
            'amount' => $amount,
            'payment_date' => now(),
            'payment_method' => $request->input('payment_method', 'Cash'),
            'reference_number' => $request->input('reference_number', 'REF-' . rand(10000, 99999)),
        ]);

        $newPaid = $fee->amount_paid + $amount;
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
