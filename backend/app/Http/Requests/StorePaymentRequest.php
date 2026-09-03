<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StorePaymentRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'school_fee_id' => 'required|exists:school_fees,id',
            'amount' => 'required|numeric',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string',
            'reference_number' => 'nullable|string'
        ];
    }
}
