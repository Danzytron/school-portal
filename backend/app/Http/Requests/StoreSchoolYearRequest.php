<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StoreSchoolYearRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'year_start' => 'required|integer',
            'year_end' => 'required|integer'
        ];
    }
}
