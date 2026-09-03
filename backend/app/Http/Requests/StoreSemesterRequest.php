<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StoreSemesterRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'school_year_id' => 'required|exists:school_years,id',
            'name' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date'
        ];
    }
}
