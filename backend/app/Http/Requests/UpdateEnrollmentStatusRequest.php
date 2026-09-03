<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class UpdateEnrollmentStatusRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'status' => 'required|in:approved,rejected,cancelled',
            'remarks' => 'nullable|string'
        ];
    }
}
