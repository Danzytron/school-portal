<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class UpdateGradeRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'midterm' => 'nullable|numeric',
            'final' => 'nullable|numeric'
        ];
    }
}
